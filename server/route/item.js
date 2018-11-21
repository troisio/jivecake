import mongodb from 'mongodb';

import { Item, Currency } from 'common/models';
import { Method, Require, Permission } from 'router';
import { EventCollection, ItemCollection, TransactionCollection } from 'database';
import { DEFAULT_MAX_LENGTH } from 'api';

const ITEM_SCHEMA = {
  type: 'object',
  required: ['name', 'maxiumumAvailable', 'published', 'amount', 'currency', 'paymentProfileId'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: DEFAULT_MAX_LENGTH
    },
    amount: {
      if: { type: 'integer' },
      then: { minimum: 0 },
      else: { type: 'null' }
    },
    currency: {
      enum: [Currency.USD, Currency.EUR, Currency.CAD, Currency.JPY, Currency.KRW, null]
    },
    maxiumumAvailable: {
      type: ['integer', 'null'],
      minimum: 0
    },
    paymentProfileId: {
      if: { type: 'string' },
      then: { format: 'objectId' },
      else: { type: 'null' }
    },
    published: {
      type: 'boolean'
    }
  }
};

export const GET_ITEM = {
  method: Method.GET,
  path: '/item/:itemId',
  accessRules: [
    {
      permission: Permission.READ,
      collection: ItemCollection,
      param: 'itemId'
    }
  ],
  on: async (request, response, { db }) => {
    const entity = await db.collection(ItemCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.itemId) });
    response.json(entity);
  }
}

export const CREATE_ITEM = {
  method: Method.POST,
  path: '/event/:eventId/item',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  bodySchema: ITEM_SCHEMA,
  on: async (request, response, { db }) => {
    const item = new Item();
    item.name = request.body.name;
    item.organizationId = new mongodb.ObjectID(request.params.id);
    item.created = new Date();

    await db.collection(ItemCollection).insertOne(item);
    const entity = await db.collection(ItemCollection).findOne({ _id: item.id });
    response.json(entity);
  }
}

export const UPDATE_ITEM = {
  method: Method.POST,
  path: '/item/:itemId',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: ItemCollection,
      param: 'itemId'
    }
  ],
  bodySchema: ITEM_SCHEMA,
  on: async (request, response, { db }) => {
    const updateObject = { ...request.body };
    updateObject.lastUserActivity = new Date();

    const entity = await db.collection(ItemCollection)
      .updateOne({ _id: new mongodb.ObjectId(request.params.itemId) }, updateObject);
    response.json(entity);
  }
}

export const GET_ITEM_TRANSACTIONS = {
  method: Method.POST,
  path: '/item/:itemId',
  accessRules: [
    {
      permission: Permission.READ,
      collection: ItemCollection,
      param: 'itemId'
    }
  ],
  requires: [
    Require.Authenticated,
    Require.Page
  ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const item = await db.collection(ItemCollection)
      .findOne({ _id: new mongodb.ObjectId(request.params.itemId) });

    const cursor = await db.collection(TransactionCollection)
      .find({
        eventId: item.eventId,
        itemId: item._id,
      })
      .skip(skip)
      .limit(limit);

    const countFuture = cursor.count();
    const entityFuture = cursor.toArray();

    response.json({
      count: await countFuture,
      entity: await entityFuture
    });
  }
}
