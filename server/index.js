const Sentry = require('@sentry/node');
import SibApiV3Sdk from 'sib-api-v3-sdk';

import express from 'express';
import bodyParser from 'body-parser';

import { MAXIMUM_IMAGE_UPLOAD_BYTES } from 'common/schema';

import { getDatabase } from './database';
import { settings } from 'settings';
import { Router } from 'router';
import { T } from 'common/i18n';

import {
  CREATE_ACCOUNT,
  GET_TOKEN,
  GET_USER,
  USER_BY_EMAIL,
  UPDATE_USER,
  PASSWORD_RECOVERY,
  GET_ORGANIZATIONS
} from 'route/user';

import {
  GET_ORGANIZATION_EVENTS,
  CREATE_ORGANIZATION,
  GET_ORGANIZATION,
  DELETE_USER,
  INVITE_USER,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR
} from 'route/organization';

import {
    CREATE_EVENT,
    GET_EVENT,
    GET_EVENT_ITEMS,
    GET_TRANSACTIONS,
    DELETE_EVENT
} from 'route/event';

import {
    GET_ITEM,
    CREATE_ITEM,
    UPDATE_ITEM,
    DELETE_ITEM
} from 'route/item';

Sentry.init(settings.sentry);

const localSentry = {
  captureException: (e) => console.error(e),
  captureMessage: (e) => console.warn(e)
};
const sentry = settings.sentry.local ? localSentry : Sentry;

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

application.use(bodyParser.raw({
  type: ['image/jpeg', 'image/png'],
  limit: MAXIMUM_IMAGE_UPLOAD_BYTES
}));

application.use((err, req, res, next) => {
  sentry.captureMessage(err);
  next(err);
});

export const run = () => {
  getDatabase().then((db) => {
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = settings.sendinblue.key;
    return new Router(application, sentry, db, SibApiV3Sdk, T);
  }, (e) => {
    sentry.captureException(e);
  }).then((router) => {
    const routes = [
      USER_BY_EMAIL,  /* must appear before GET_USER */
      PASSWORD_RECOVERY, /* must appear before GET_USER */
      GET_ORGANIZATIONS, /* must appear before GET_USER */
      CREATE_ACCOUNT,
      GET_USER,
      GET_TOKEN,
      UPDATE_USER,
      UPDATE_USER,

      CREATE_ORGANIZATION,
      GET_ORGANIZATION,
      GET_ORGANIZATION_EVENTS,
      DELETE_USER,
      INVITE_USER,
      UPDATE_ORGANIZATION,
      UPDATE_ORGANIZATION_AVATAR,

      CREATE_EVENT,
      GET_EVENT,
      GET_EVENT_ITEMS,
      GET_TRANSACTIONS,
      DELETE_EVENT,

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
