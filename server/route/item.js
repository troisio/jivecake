import mongodb from 'mongodb';

import { Item } from 'common/models';
import { ITEM_PATH, EVENT_ITEMS_PATH } from 'common/routes';

import { Permission } from 'server/router';
import { EventCollection, ItemCollection, TransactionCollection } from 'server/database';
import { ITEM_SCHEMA } from 'common/schema';

export const GET_ITEM = {
  method: 'GET',
  path: ITEM_PATH,
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
};

export const DELETE_ITEM = {
  method: 'DELETE',
  path: ITEM_PATH,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: ItemCollection,
      param: 'itemId'
    }
  ],
  on: async (request, response, { db }) => {
    const itemId = new mongodb.ObjectID(request.params.itemId);
    const transactionsCount = await db.collection(TransactionCollection)
      .find({ itemId })
      .count();

    if (transactionsCount > 0) {
      response.status(400);
      return response.json({
        error: 'transaction_exist'
      });
    }

    await db.collection(ItemCollection).deleteOne({ _id: itemId });
    response.status(200).end();
  }
};

export const CREATE_ITEM = {
  method: 'POST',
  path: EVENT_ITEMS_PATH,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  bodySchema: ITEM_SCHEMA,
  on: async (request, response, { db }) => {
    const eventId = new mongodb.ObjectID(request.params.eventId);
    const event = await db.collection(EventCollection)
      .findOne({ _id: eventId });
    const item = Object.assign(new Item(), request.body);

    item.eventId = eventId;
    item.organizationId = event.organizationId;
    item.lastUserActivity = new Date();
    item.created = new Date();

    await db.collection(ItemCollection).insertOne(item);
    response.json({ _id: item._id });
  }
};

export const UPDATE_ITEM = {
  method: 'POST',
  path: ITEM_PATH,
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
};
