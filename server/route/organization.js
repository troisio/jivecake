import mongodb from 'mongodb';

import { Method, Require, Permission } from 'router';
import { EventCollection, OrganizationCollection } from 'database';
import { Organization } from 'common/models';
import { DEFAULT_MAX_LENGTH } from 'api';

export const CREATE_ORGANIZATION = {
  method: Method.POST,
  path: '/organization',
  requires: [ Require.Authenticated ],
  bodySchema: {
    type: 'object',
    required: ['name', 'email'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        maxLength: DEFAULT_MAX_LENGTH
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: DEFAULT_MAX_LENGTH
      }
    }
  },
  on: async (request, response, { db, jwt: { sub } }) => {
    const organization = new Organization();
    const ownerId = new mongodb.ObjectId(sub);
    organization.read = [ ownerId ];
    organization.email = request.body.email;
    organization.name = request.body.name;
    organization.emailVerified = false;
    organization.write = [ ownerId ];
    organization.createdBy = ownerId;
    organization.created = new Date();

    await db.collection(OrganizationCollection).insertOne(organization);
    const searchOrganization = await db.collection(OrganizationCollection)
      .findOne({ _id: organization._id });
    response.json(searchOrganization);
  }
}

export const GET_ORGANIZATION = {
  method: Method.GET,
  path: '/organization/:id',
  accessRules: [
    {
      permission: Permission.READ,
      collection: OrganizationCollection,
      param: 'id'
    }
  ],
  requires: [ Require.Authenticated ],
  on: async (request, response, { db }) => {
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.id) });
    response.json(organization);
  }
}

export const GET_ORGANIZATION_EVENTS = {
  method: Method.GET,
  path: '/organization/:id/event',
  accessRules: [
    {
      permission: Permission.READ,
      collection: OrganizationCollection,
      param: 'id'
    }
  ],
  requires: [
    Require.Authenticated,
    Require.Page
  ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const cursor = await db.collection(EventCollection)
      .find({ organizationId: new mongodb.ObjectID(request.params.id) })
      .skip(skip)
      .limit(limit);

    const countFuture = cursor.count();
    const eventsFuture = cursor.toArray();

    response.json({
      count: await countFuture,
      entity: await eventsFuture
    });
  }
}
