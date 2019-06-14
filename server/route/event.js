import mongodb from 'mongodb';
import stripe from 'stripe';

import { upload, deleteObject } from 'server/digitalocean';
import {
  EVENT_PATH,
  EVENT_ITEMS_PATH,
  EVENT_AVATAR_PATH,
  ORGANIZATION_EVENTS_PATH,
  EVENT_PURCHASE_PATH
} from 'common/routes';
import { Require, Permission } from 'server/router';
import { EventCollection, ItemCollection, OrganizationCollection, TransactionCollection } from 'server/database';
import { Event } from 'common/models';
import { EVENT_SCHEMA } from 'common/schema';

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
  bodySchema: EVENT_SCHEMA,
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
    event.lastUserActivity = event.created;

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

export const UPDATE_EVENT_AVATAR = {
  method: 'POST',
  path: EVENT_AVATAR_PATH,
  requires: [ Require.Authenticated ],
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: EventCollection,
      param: 'eventId'
    }
  ],
  on: async (request, response, { db }) => {
    const event = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.eventId) });
    const type = request.headers['content-type'];

    let ext;

    if (type === 'image/jpeg') {
      ext = '.jpg';
    } else if (type === 'image/png') {
      ext = '.png';
    } else {
      return response.status(415).end();
    }

    if (event.avatar !== null) {
      const parts = event.avatar.split('/');
      const key = parts[parts.length - 1];
      await deleteObject(key);
    }

    const name = new mongodb.ObjectId().toString() + ext;
    const { url } = await upload(name, request.body, type);

    const $set = {
      lastUserActivity: new Date(),
      avatar: url
    };

    await db.collection(EventCollection).updateOne({ _id: event._id }, { $set });
    response.status(200).end();
  }
};

export const PURCHASE = {
  method: 'POST',
  path: EVENT_PURCHASE_PATH,
  requires: [ Require.Authenticated ],
  on: async (response, request, { db, jwt: { sub } }) => {
    const event = await db.collection(EventCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.eventId) });
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: event.organizationId });

    stripe.charges.create({
      amount: 1000,
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
      response.status();
    });
  }
};
