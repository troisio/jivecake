import express from 'express';

import { EntityType } from 'common';

import { getDatabase } from './database';
import { settings } from './settings';
import { register, Method, Require, Permission } from './router';

const application = express();

export const run = () => {
  register(application, {
    method: Method.POST,
    path: '/organization/:organizationId',
    accessRules: [
      {
        permission: Permission.WRITE,
        entityType: EntityType.Organization,
        param: 'organizationId'
      }
    ],
    requires: [ Require.Authenticated ]
  });

  application.listen(settings.port, async () => {
    console.log('listening on port ' + settings.port);

    const db = await getDatabase();
    console.log('db', db);
  });
};
