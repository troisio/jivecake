import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongodb from 'mongodb';

import jwtkeysecret from 'extra/jwt/jwt.key';

import { DEFAULT_MAX_LENGTH } from 'api';
import { Method, Require, Permission } from 'router';
import { UserCollection } from '../database';
import { User } from 'common/models';

export const GET_USER = {
  method: Method.GET,
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
}

export const USER_BY_EMAIL = {
  method: Method.GET,
  path: '/user/email',
  querySchema: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: DEFAULT_MAX_LENGTH
      }
    }
  },
  on: async (request, response, { db }) => {
    const user = await db.collection(UserCollection).findOne({ email: request.query.email });

    if (user === null) {
      response.sendStatus(404);
    } else {
      response.json({
        email: user.email
      });
    }
  }
}

export const CREATE_ACCOUNT = {
  method: Method.POST,
  path: '/account',
  bodySchema: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 200
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 100
      }
    }
  },
  on: async (request, response, { db }) => {
    const { body: { email, password } } = request;
    const user = await db.collection(UserCollection).findOne({ email });

    if (user === null) {
      const hashedPassword = await new Promise((resolve, reject) => {
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

      const user = new User();
      user.email = email;
      user.hashedPassword = hashedPassword;
      user.created = new Date();

      await db.collection(UserCollection).insertOne(user);
      const searchedUser = await db.collection(UserCollection).findOne({ email: user.email });
      searchedUser.hashedPassword = null;
      response.json(searchedUser);
    } else {
      response.sendStatus(409).end();
    }
  }
}

export const GET_TOKEN = {
  method: Method.POST,
  path: '/token',
  on: async (request, response, { db, sentry }) => {
    const { body: { email, password } } = request;
    const user = await db.collection(UserCollection).findOne({ email });

    if (user === null) {
      response.sendStatus(401).end();
    } else {
      bcrypt.compare(password, user.hashedPassword, (err, res) => {
        if (err) {
          sentry.captureException(err);
          response.sendStatus(401).end();
        } else if (res === true) {
          const sevenDaysAfter = new Date();
          sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
          const exp = Math.floor(sevenDaysAfter.getTime() / 1000);

          jwt.sign({ sub: user._id, exp }, jwtkeysecret, { algorithm: 'HS256' }, (err, token) => {
            if (err) {
              sentry.captureException(err);
              response.sendStatus(401).end();
            } else {
              response.json({ user: _.omit(user, ['hashedPassword']), token });
            }
          });
        } else {
          sentry.captureMessage('invalid password attempt');
          response.sendStatus(401).end();
        }
      });
    }
  }
}
