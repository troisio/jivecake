const Sentry = require('@sentry/node');
import SibApiV3Sdk from 'sib-api-v3-sdk';

import express from 'express';
import bodyParser from 'body-parser';

import { MAXIMUM_IMAGE_UPLOAD_BYTES } from 'common/schema';

import { getDatabase } from 'server/database';
import { settings } from 'server/settings';
import { Router } from 'server/router';
import { T } from 'common/i18n';

import {
  CREATE_ACCOUNT,
  GET_TOKEN,
  GET_USER,
  USER_BY_EMAIL,
  UPDATE_USER,
  PASSWORD_RECOVERY,
  GET_USER_ORGANIZATIONS,
  GET_USER_TRANSACTIONS
} from 'server/route/user';

import {
  GET_ORGANIZATION_EVENTS,
  CREATE_ORGANIZATION,
  GET_ORGANIZATION,
  DELETE_USER,
  INVITE_USER,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR,
  ORGANIZATION_CONNECT_STRIPE
} from 'server/route/organization';

import {
    CREATE_EVENT,
    GET_EVENT,
    GET_EVENT_ITEMS,
    UPDATE_EVENT,
    UPDATE_EVENT_AVATAR
} from 'server/route/event';

import {
    GET_ITEM,
    CREATE_ITEM,
    UPDATE_ITEM,
    DELETE_ITEM
} from 'server/route/item';

Sentry.init(settings.sentry);

const application = express();

application.use((req, res, next) => {
  const origin = req.headers['origin'];
  const requestHeaders = req.headers['access-control-request-headers'];
  const hasValidOrigin = settings.http.origins.includes(origin);

  if (hasValidOrigin) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  if (requestHeaders) {
    res.header('Access-Control-Allow-Headers', requestHeaders);
  }

  next();
});

application.use(bodyParser.json());

// change to express.raw

application.use(bodyParser.raw({
  type: ['image/jpeg', 'image/png'],
  limit: MAXIMUM_IMAGE_UPLOAD_BYTES
}));

application.use((err, req, res, next) => {
  Sentry.captureMessage(err);
  next(err);
});

export const run = () => {
  getDatabase().then((db) => {
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = settings.sendinblue.key;
    return new Router(application, Sentry, db, SibApiV3Sdk, T);
  }, (e) => {
    Sentry.captureException(e);
  }).then((router) => {
    const routes = [
      USER_BY_EMAIL,  /* must appear before GET_USER */
      PASSWORD_RECOVERY, /* must appear before GET_USER */
      GET_USER_ORGANIZATIONS, /* must appear before GET_USER */
      CREATE_ACCOUNT,
      GET_USER,
      GET_TOKEN,
      UPDATE_USER,
      UPDATE_USER,
      GET_USER_TRANSACTIONS,

      CREATE_ORGANIZATION,
      GET_ORGANIZATION,
      GET_ORGANIZATION_EVENTS,
      DELETE_USER,
      INVITE_USER,
      UPDATE_ORGANIZATION,
      UPDATE_ORGANIZATION_AVATAR,
      ORGANIZATION_CONNECT_STRIPE,

      UPDATE_EVENT,
      UPDATE_EVENT_AVATAR,
      CREATE_EVENT,
      GET_EVENT,
      GET_EVENT_ITEMS,

      GET_ITEM,
      CREATE_ITEM,
      UPDATE_ITEM,
      DELETE_ITEM
    ];

    for (const route of routes) {
      router.register(route);
    }

    application.listen(settings.port, () => {
      console.log('listening on port ' + settings.port);
    });
  });
};
