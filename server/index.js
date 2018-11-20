const Sentry = require('@sentry/node');

import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtkey from 'extra/jwt/jwt.key';

import { EntityType, User } from 'common/models';
import { getDatabase } from './database';
import { settings } from 'settings';
import { Router, Method, Require, Permission } from './router';

Sentry.init(settings.sentry);
const SALT_ROUNDS = 10;

const application = express();
application.use(bodyParser.json());

export const run = async () => {
  console.log('jwtkey', jwtkey);

  getDatabase().then((db) => {
    const router = new Router(application, Sentry, db);
    return router;
  }, (e) => {
    Sentry.captureException(e);
  }).then((router) => {
    router.register({
      method: Method.GET,
      path: '/user/:id',
      accessRules: [
        {
          permission: Permission.READ,
          entityType: EntityType.User,
          param: 'id'
        }
      ],
      requires: [ Require.Authenticated ],
      on: (request, response, injection) => {
        const { jwt } = injection;
        response.json(jwt);
      }
    });

    router.register({
      method: Method.POST,
      path: '/account',
      on: async (request, response, extra) => {
        const { body: { email, password } } = request;
        const { db } = extra;

        const user = await db.collection(EntityType.User).findOne({ email });

        if (user === null) {
          const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
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

          await db.collection(EntityType.User).insertOne(user);
          const searchedUser = await db.collection(EntityType.User).findOne({ email: user.email });
          searchedUser.hashedPassword = null;
          response.json(searchedUser);
        } else {
          response.sendStatus(409).end();
        }
      }
    });

    router.register({
      method: Method.POST,
      path: '/token',
      on: async (request, response, { db }) => {
        const { body: { email, password } } = request;
        const user = await db.collection(EntityType.User).findOne({ email });

        if (user === null) {
          response.sendStatus(401).end();
        } else {

          bcrypt.compare(password, user.hashedPassword, (err, res) => {
            if (err) {
              Sentry.captureException(err);
              response.sendStatus(401).end();
            } else if (res === true) {
              jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
              }, jwtkey, { algorithm: 'RS256' }, (err, token) => {
                if (err) {
                  Sentry.captureException(err);
                  response.sendStatus(401).end();
                } else {
                  response.json({ token });
                }
              });
            } else {
              Sentry.captureMessage('invalid password attempt');
              response.sendStatus(401).end();
            }
          });
        }
      }
    });

    application.listen(settings.port, () => {
      console.log('listening on port ' + settings.port);
    });
  })
};
