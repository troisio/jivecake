import mongodb from 'mongodb';

import { Require, Permission } from 'router';
import { EventCollection, ItemCollection, OrganizationCollection, TransactionCollection } from 'database';
import { Event } from 'common/models';
import { DEFAULT_MAX_LENGTH } from 'common/schema';
import { OBJECT_ID_REGEX_PORTION } from 'common/helpers';

export const CREATE_EVENT = {
  method: 'POST',
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
    required: ['name', 'published'],
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
    event.published = request.body.published;
    event.organizationId = new mongodb.ObjectID(request.params.id);
    event.created = new Date();
    event.lastUserActivity = event.created;

    await db.collection(EventCollection).insertOne(event);
    response.json({ _id: event._id });
  }
};

export const GET_EVENT = {
  method: 'GET',
  path: `/event/:eventId(${OBJECT_ID_REGEX_PORTION})`,
  accessRules: [
    {
      permission: Permission.READ,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  on: async (request, response, { db }) => {
    const searchedEvent = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectId(request.params.eventId) });
    response.json(searchedEvent);
  }
};

export const GET_EVENT_ITEMS = {
  method: 'POST',
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
  method: 'POST',
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
