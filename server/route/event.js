import mongodb from 'mongodb';
import _ from 'lodash';

import {
  EVENT_PATH,
  EVENT_ITEMS_PATH,
  ORGANIZATION_EVENTS_PATH,
  EVENT_INFORMATION_PATH,
  EVENT_STRIPE_CHECKOUT_SESSION_PATH
} from 'common/routes';
import { Require, Permission } from 'server/router';
import {
  EventCollection,
  ItemCollection,
  OrganizationCollection,
  UserCollection,
  TransactionCollection,
  SORT_DIRECTIONS_AS_STRING
} from 'server/database';
import { Event, Transaction, CURRENCY_TO_APPLICATION_FEE } from 'common/models';
import { EVENT_SCHEMA, EVENT_PURCHASE_SCHEMA } from 'common/schema';
import { getHashSelections } from 'common/helpers';
import { updatePaymentIntent } from 'server/helper/stripe';

export const START_STRIPE_SESSION = {
  method: 'POST',
  path: EVENT_STRIPE_CHECKOUT_SESSION_PATH,
  requires: [ Require.Authenticated ],
  bodySchema: EVENT_PURCHASE_SCHEMA,
  on: async (request, response, { webRoutes, stripe, db, jwt: { sub } }) => {
    const event = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.eventId), published: true });

    if (!event) {
      response.status(404).end();
      return;
    }

    if (!event.currency) {
      response.json({ error: 'currency' }).status(400).end();
      return;
    }

    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: event.organizationId });

    if (!organization.stripe) {
      response.json({ error: 'organization.stripe' }).status(400).end();
      return;
    }

    const getTransactions = () => db.collection(TransactionCollection)
      .find({ eventId: event._id })
      .toArray();

    await updatePaymentIntent(db, stripe, await getTransactions());

    const idToQuantity = await db.collection(TransactionCollection).aggregate([
      { $match: { eventId: event._id, 'paymentIntent.status': 'succeeded' } },
      { $unwind : '$items' },
      { $group : { _id: '_id', quantity: { $sum: '$quantity' } } }
    ]).toArray();

    const itemIds = request.body.items.map(({ _id }) => new mongodb.ObjectId(_id));
    const items = await db.collection(ItemCollection)
      .find({
        _id: { $in: itemIds },
        eventId: event._id,
        published: true
      })
      .toArray();

    if (items.length !== itemIds.length) {
      response.json({ error: 'items' }).status(400).end();
      return;
    }

    const idToItem = _.keyBy(items, '_id');

    for (const { _id, quantity } of request.body.items) {
      const searchedItem = idToQuantity.find(item => new mongodb.ObjectId(_id).equals(item._id));
      const totalAfterTransaction = quantity + (searchedItem ? searchedItem.quantity : 0);

      const item = idToItem[_id];
      if (item.maxiumumAvailable && totalAfterTransaction > item.maxiumumAvailable) {
        response.json({ error: 'maxiumumAvailable', item: item._id }).status(400).end();
        return;
      }
    }

    const line_items = request.body.items.map(({ _id, quantity }) => {
      const item = idToItem[_id];
      return {
        name: item.name,
        images: item.avatar ? [ item.avatar ] : [],
        amount: item.amount,
        currency: event.currency,
        quantity
      };
    });

    const user = await db.collection(UserCollection).findOne({ _id: new mongodb.ObjectID(sub) });
    const session = await stripe.checkout.sessions.create(
      {
        customer_email: user.email,
        payment_method_types: ['card'],
        line_items,
        success_url: webRoutes.userTransactions(sub),
        cancel_url: webRoutes.eventPublic(event.hash),
        payment_intent_data: {
          application_fee_amount: CURRENCY_TO_APPLICATION_FEE[event.currency],
          on_behalf_of: organization.stripe.stripe_user_id,
          transfer_data: {
            destination:  organization.stripe.stripe_user_id
          }
        },
      }
    );
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    const userId = new mongodb.ObjectId(sub);

    const transaction = new Transaction();
    transaction.eventId = event._id;
    transaction.userId = userId;
    transaction.session = session;
    transaction.paymentIntent = paymentIntent;
    transaction.items = request.body.items;
    transaction.created = new Date();

    await db.collection(TransactionCollection).insertOne(transaction);

    response.json(session).end();
  }
};

export const GET_EVENT_INFORMATION = {
  method: 'GET',
  path: EVENT_INFORMATION_PATH,
  on: async (request, response, { db }) => {
    const event = await db.collection(EventCollection)
      .findOne({ hash: request.params.hash, published: true });

    if (!event || !event.published) {
      return response.status(404).end();
    }

    const items = await db.collection(ItemCollection)
      .find({ eventId: event._id, published: true })
      .sort({ order: -1 })
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
    event.hash = _.sampleSize(getHashSelections(), 6).join('');
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
