import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongodb from 'mongodb';

import jwtkeysecret from 'extra/jwt/jwt.key';
import { settings } from 'settings';
import { EMAIL_COLLATION } from 'server/database';

import { Require, Permission } from 'router';
import {
  OrganizationCollection,
  PasswordRecoveryCollection,
  UserCollection,
  SORT_DIRECTIONS_AS_STRING
} from 'database';
import { PasswordRecovery, User, SUPPORTED_LANGUAGE_IDS } from 'common/models';
import { USER_SCHEMA } from 'common/schema';
import { getUserLanguage } from 'common/helpers';

const SELECTED_LANGUAGE_OPTIONS = [ ...SUPPORTED_LANGUAGE_IDS, null ];

const getHashedPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
};

export const GET_USER = {
  method: 'GET',
  path: '/user/:id',
  accessRules: [
    {
      permission: Permission.READ,
      collection: UserCollection,
      param: 'id'
    }
  ],
  requires: [ Require.Authenticated ],
  on: async (request, response, { db }) => {
    const user = await db.collection(UserCollection).findOne({ _id: new mongodb.ObjectID(request.params.id) });
    response.json(_.omit(user, ['hashedPassword']));
  }
};

export const PASSWORD_RECOVERY = {
  method: 'POST',
  path: '/user/password_recovery',
  bodySchema: {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
      email: USER_SCHEMA.email
    }
  },
  on: async (request, response, { db, SibApiV3Sdk, T }) => {
    const user = await db.collection(UserCollection)
      .findOne({ email: request.body.email });

    if (user !== null) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const passwordRecovery = await db.collection(PasswordRecoveryCollection)
        .findOne({ userId: user._id, created: { $gt: oneHourAgo } });

      if (passwordRecovery !== null) {
        return response
          .status(400)
          .json({ error: 'within_hour' });
      }

      const entity = new PasswordRecovery();
      entity.userId = user._id;
      entity.created = new Date();

      await db.collection(PasswordRecoveryCollection).insertOne(entity);

      const lng = getUserLanguage(user);
      const api = new SibApiV3Sdk.SMTPApi();
      const options = new SibApiV3Sdk.SendSmtpEmail();
      options.to = [{ email: user.email }];
      options.htmlContent = `<a href='${settings.web.origin}/password-recovery/${entity._id}'>${T('Reset your password', { lng })}</a> - JiveCake`;
      options.subject = T('JiveCake Password Reset', { lng });
      options.sender = {
        name: 'JiveCake',
        email: 'noreply@jivecake.com'
      };

      await api.sendTransacEmail(options);
    }

    response.status(200);
  }
};

export const USER_BY_EMAIL = {
  method: 'GET',
  path: '/user/email',
  querySchema: {
    type: 'object',
    required: ['email'],
    properties: {
      email: USER_SCHEMA.email
    }
  },
  on: async (request, response, { db }) => {
    const usersWithSameEmail = await db.collection(UserCollection)
      .find({ email: request.query.email })
      .collation(EMAIL_COLLATION)
      .toArray();

    if (usersWithSameEmail.length === 0) {
      response.status(404).end();
    } else {
      const user = usersWithSameEmail[0];
      const entity = _.pick(user, ['_id', 'email']);
      response.json(entity);
    }
  }
};

export const GET_USER_ORGANIZATIONS = {
  method: 'GET',
  path: '/user/:userId/organization',
  accessRules: [
    {
      permission: Permission.READ,
      collection: UserCollection,
      param: 'userId'
    }
  ],
  querySchema: {
    type: 'object',
    properties: {
      lastUserActivity: {
        enum: SORT_DIRECTIONS_AS_STRING
      },
      lastSystemActivity: {
        enum: SORT_DIRECTIONS_AS_STRING
      }
    }
  },
  requires: [ Require.Page ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const userId = new mongodb.ObjectID(request.params.userId);
    const sort =_.mapValues(
      _.pick(request.query, ['lastUserActivity', 'lastSystemActivity']),
      value => Number(value)
    );

    const cursor = await db.collection(OrganizationCollection)
      .find({
        $or: [
          { read: userId },
          { write: userId },
          { owner: userId }
        ]
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const countFuture = cursor.count();
    const entityFuture = cursor.toArray();

    response.json({
      count: await countFuture,
      entity: await entityFuture
    });
  }
};

export const UPDATE_USER = {
  method: 'POST',
  path: '/user/:userId',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: UserCollection,
      param: 'userId'
    }
  ],
  bodySchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      email: USER_SCHEMA.email,
      password: USER_SCHEMA.password,
      selectedLanguage: {
        enum: SELECTED_LANGUAGE_OPTIONS
      },
      lastLanguage: {
        enum: SUPPORTED_LANGUAGE_IDS
      },
      lastOrganizationId:  {
        type: 'string',
        format: 'objectid'
      }
    }
  },
  on: async (request, response, { db }) => {
    const user = await db.collection(UserCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.userId) });

    const $set = { ...request.body };

    if ($set.hasOwnProperty('email')) {
      const userWithSameEmail = await db.collection(UserCollection)
        .find({ _id: { $ne: user._id }, email: $set.email })
        .collation(EMAIL_COLLATION)
        .count();

      if (userWithSameEmail > 0) {
        response.status(409).end();
        return;
      }
    }

    if ($set.hasOwnProperty('lastOrganizationId')) {
      $set.lastOrganizationId = new mongodb.ObjectID($set.lastOrganizationId);

      const organization = await db.collection(OrganizationCollection)
        .findOne({
          _id: $set.lastOrganizationId,
          $or: [
            { read: user._id },
            { write: user._id },
            { owner: user._id }
          ]
        });

      if (organization === null) {
        response.status(404).json({
          error: 'lastOrganizationId'
        });
        return;
      }
    }

    const now = new Date();
    $set.lastUserActivity = now;
    $set.updated = now;

    if (request.body.hasOwnProperty('password')) {
      $set.hashedPassword = await getHashedPassword(request.body.password);
    }

    await db.collection(UserCollection).updateOne({ _id: user._id }, { $set });
    response.status(200).end();
  }
};

export const CREATE_ACCOUNT = {
  method: 'POST',
  path: '/account',
  bodySchema: {
    type: 'object',
    required: ['email', 'password', 'lastLanguage'],
    additionalProperties: false,
    properties: {
      email: USER_SCHEMA.email,
      password: USER_SCHEMA.password,
      lastLanguage: {
        enum: SUPPORTED_LANGUAGE_IDS
      }
    }
  },
  on: async (request, response, { db }) => {
    const { body: { email, password, lastLanguage } } = request;
    const user = await db.collection(UserCollection).findOne({ email });

    if (user === null) {
      const hashedPassword = await getHashedPassword(password);
      const user = new User();
      user.email = email;
      user.hashedPassword = hashedPassword;
      user.lastLanguage = lastLanguage;
      user.lastUserActivity = new Date();
      user.created = new Date();

      await db.collection(UserCollection).insertOne(user);
      response.status(200).end();
    } else {
      response.status(409).end();
    }
  }
};

export const GET_TOKEN = {
  method: 'POST',
  path: '/token/password',
  on: async (request, response, { db, sentry, ip }) => {
    const { body: { email, password } } = request;
    const user = await db.collection(UserCollection).findOne({ email });

    if (user === null) {
      response.status(404).end();
    } else {
      bcrypt.compare(password, user.hashedPassword, (err, res) => {
        if (err) {
          sentry.captureException(err);
          response.status(401).end();
        } else if (res === true) {
          const sevenDaysAfter = new Date();
          sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
          const exp = Math.floor(sevenDaysAfter.getTime() / 1000);

          jwt.sign({ sub: user._id, exp }, jwtkeysecret, { algorithm: 'HS256' }, (err, token) => {
            if (err) {
              sentry.captureException(err);
              response.status(401).end();
            } else {
              response.json({ token });
            }
          });
        } else {
          sentry.captureMessage('invalid password attempt by ' + ip + ' for account ' + email);
          response.status(401).end();
        }
      });
    }
  }
};
