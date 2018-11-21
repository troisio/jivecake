const Sentry = require('@sentry/node');

import express from 'express';
import bodyParser from 'body-parser';

import { getDatabase } from './database';
import { settings } from 'settings';
import { Router } from 'router';

import {
  CREATE_ACCOUNT,
  GET_TOKEN,
  GET_USER,
  USER_BY_EMAIL
} from 'route/user';

import {
  GET_ORGANIZATION_EVENTS,
  CREATE_ORGANIZATION,
  GET_ORGANIZATION
} from 'route/organization';

import {
    CREATE_EVENT,
    GET_EVENT,
    GET_EVENT_ITEMS,
} from 'route/event';

import {
    GET_ITEM,
    CREATE_ITEM,
    UPDATE_ITEM,
    GET_ITEM_TRANSACTIONS
} from 'route/item';

Sentry.init(settings.sentry);

const application = express();
application.use(bodyParser.json());

export const run = async () => {
  getDatabase().then((db) => {
    const sentry = {
      captureException: (e) => console.log(e),
      captureMessage: (e) => console.log(e),
    };

    const router = new Router(application, sentry, db);
    return router;
  }, (e) => {
    Sentry.captureException(e);
  }).then((router) => {
    router.register(CREATE_ACCOUNT);
    router.register(USER_BY_EMAIL); /* must appear before GET_USER */
    router.register(GET_USER);
    router.register(GET_TOKEN);

    router.register(CREATE_ORGANIZATION);
    router.register(GET_ORGANIZATION);
    router.register(GET_ORGANIZATION_EVENTS);

    router.register(CREATE_EVENT);
    router.register(GET_EVENT);
    router.register(GET_EVENT_ITEMS);

    router.register(GET_ITEM);
    router.register(CREATE_ITEM);
    router.register(UPDATE_ITEM);
    router.register(GET_ITEM_TRANSACTIONS);

    application.listen(settings.port, () => {
      console.log('listening on port ' + settings.port);
    });
  })
};
