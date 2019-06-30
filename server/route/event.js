import mongodb from 'mongodb';
import stripe from 'stripe';
import _ from 'lodash';

import {
  EVENT_PATH,
  EVENT_ITEMS_PATH,
  ORGANIZATION_EVENTS_PATH,
  EVENT_PURCHASE_PATH
} from 'common/routes';
import { Require, Permission } from 'server/router';
import {
  EventCollection,
  ItemCollection,
  OrganizationCollection,
  TransactionCollection,
  SORT_DIRECTIONS_AS_STRING
} from 'server/database';
import { Event } from 'common/models';
import { EVENT_SCHEMA, EVENT_PURCHASE_SCHEMA } from 'common/schema';
import { getHashSelections, getRandomString } from 'common/helpers';

const HASH_SELECTIONS = getHashSelections();

export const PURCHASE = {
  method: 'POST',
  path: EVENT_PURCHASE_PATH,
  requires: [ Require.Authenticated ],
  bodySchema: EVENT_PURCHASE_SCHEMA,
  on: async (response, request, { db, jwt: { sub } }) => {
    const event = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.eventId), published: true });

    if (!event) {
      response.status(400).end();
      return;
    }

    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: event.organizationId });

    if (!organization.stripe) {
      response.status(400).end();
      return;
    }

    const itemIds = request.body.items.map(({ _id }) => _id);
    const items = await db.collection(ItemCollection)
      .find({
        _id: { $in: itemIds },
        published: true
      })
      .toArray();

    if (items.length !== itemIds.length) {
      response.json({ error: 'itemCount' }).end();
      return;
    }

    const idToItem = _.keyBy(items, '_id');
    const amount = request.body.items.reduce(
      (previous, data) => previous + idToItem[data._id].amount * data.count,
      0
    );

    stripe.charges.create({
      amount,
      currency: "usd",
      source: "tok_visa",
      transfer_data: {
        destination: organization.stripe.stripe_user_id,
      },
    }).then(async () => {
        await db.collection(TransactionCollection).insertMany([
          { userId: new mongodb.ObjectId(sub) }
        ]);

      response.json({});
    }, () => {
      response.json({ error: 'stripe' }).status(503).end();
    });
  }
};

export const GET_EVENT_PURCHASE_DATA = {
  method: 'GET',
  path: EVENT_PURCHASE_PATH,
  on: async (request, response, { db }) => {
    const event = await db.collection(EventCollection)
      .findOne({ hash: request.params.hash, published: true });

    if (!event || !event.published) {
      return response.status(404).end();
    }

    const items = await db.collection(ItemCollection)
      .find({ eventId: event._id, published: true })
      .toArray();

    response.json({
      event,
      items
    });
  }
};

export const UPDATE_EVENT = {
  method: 'POST',
  path: EVENT_PATH,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  bodySchema: {
    ...EVENT_SCHEMA,
    required: []
  },
  on: async (request, response, { db }) => {
    const eventId = new mongodb.ObjectID(request.params.eventId);
    const $set = { ...request.body };
    $set.lastUserActivity = new Date();

    await db.collection(EventCollection).updateOne({ _id: eventId }, { $set });
    response.status(200).end();
  }
};

export const CREATE_EVENT = {
  method: 'POST',
  path: ORGANIZATION_EVENTS_PATH,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  bodySchema: EVENT_SCHEMA,
  on: async (request, response, { db }) => {
    const event = Object.assign(new Event(), request.body);
    event.organizationId = new mongodb.ObjectID(request.params.organizationId);
    event.created = new Date();
    event.hash = getRandomString(HASH_SELECTIONS, 6);
    event.lastUserActivity = new Date();

    await db.collection(EventCollection).insertOne(event);
    response.json({ _id: event._id });
  }
};

export const GET_EVENT = {
  method: 'GET',
  path: EVENT_PATH,
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
  method: 'GET',
  path: EVENT_ITEMS_PATH,
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
  querySchema: {
    type: 'object',
    properties: {
      order: {
        enum: SORT_DIRECTIONS_AS_STRING
      }
    }
  },
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const sort =_.mapValues(_.pick(request.query, ['order']), Number);
    const cursor = await db.collection(ItemCollection)
      .find({ eventId: new mongodb.ObjectID(request.params.eventId) })
      .sort(sort)
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
