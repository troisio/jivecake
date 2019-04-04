import mongodb from 'mongodb';

import { Method, Require, Permission } from 'router';
import { EventCollection, ItemCollection, OrganizationCollection, TransactionCollection } from 'database';
import { Event } from 'common/models';
import { DEFAULT_MAX_LENGTH } from 'common/schema';

export const CREATE_EVENT = {
  method: Method.POST,
  path: '/organization/:id/event',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'id'
    }
  ],
  bodySchema: {
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        maxLength: DEFAULT_MAX_LENGTH
      },
      published: {
        type: 'boolean'
      }
    }
  },
  on: async (request, response, { db }) => {
    const event = new Event();
    event.name = request.body.name;
    event.organizationId = new mongodb.ObjectID(request.params.id);
    event.created = new Date();

    await db.collection(EventCollection).insertOne(event);
    const searchedEvent = await db.collection(EventCollection).findOne({ _id: event.id });
    response.json(searchedEvent);
  }
};

export const DELETE_EVENT = {
  method: Method.DELETE,
  path: '/event/:eventId',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  on: async (request, response, { db }) => {
    const eventId = new mongodb.ObjectID(request.params.eventId);
    const itemCount = await db.collection(ItemCollection)
      .find({ eventId })
      .count();

    if (itemCount > 0) {
      response.status(400);
      return response.json({
        error: 'item_exist'
      });
    }

    await db.collection(EventCollection).deleteOne({ _id: eventId });
    response.sendStatus(200).end();
  }
};

export const GET_EVENT = {
  method: Method.POST,
  path: '/event/:eventId',
  accessRules: [
    {
      permission: Permission.READ,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  paramsSchema: {
    type: 'object',
    properties: {
      eventId: {
        type: 'string',
        format: 'objectid'
      },
    }
  },
  on: async (request, response, { db }) => {
    const searchedEvent = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectId(request.params.eventId) });
    response.json(searchedEvent);
  }
};

export const GET_EVENT_ITEMS = {
  method: Method.POST,
  path: '/event/:eventId/item',
  accessRules: [
    {
      permission: Permission.READ,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  requires: [
    Require.Authenticated,
    Require.Page
  ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const cursor = await db.collection(ItemCollection)
      .find({ eventId: new mongodb.ObjectID(request.params.eventId) })
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

export const GET_TRANSACTIONS = {
  method: Method.POST,
  path: '/event/:eventId',
  accessRules: [
    {
      permission: Permission.READ,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  querySchema: {
    type: 'object',
    properties: {
      itemId: {
        type: 'string',
        format: 'objectid'
      }
    }
  },
  requires: [ Require.Authenticated, Require.Page ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const query = {
      eventId: new mongodb.ObjectID(request.params.eventId)
    };

    if (request.query.hasOwnProperty('itemId')) {
      query.itemId = new mongodb.ObjectID(request.query.itemId);
    }

    const cursor = await db.collection(TransactionCollection)
      .find(query)
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
