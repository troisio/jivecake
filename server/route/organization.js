import mongodb from 'mongodb';

import { settings } from 'server/settings';

import { Require, Permission } from 'server/router';
import {
  ORGANIZATION_PATH,
  INVITE_USER_TO_ORGANIZATION,
  ORGANIZATION_EVENTS_PATH,
  ORGANIZATIONS_PATH,
  ORGANIZATION_STRIPE_CONNECT_PATH
} from 'common/routes';
import { EventCollection, OrganizationCollection, OrganizationInvitationCollection } from 'server/database';
import { Organization, OrganizationInvitation } from 'common/models';
import { ORGANIZATION_SCHEMA } from 'common/schema';

export const UPDATE_ORGANIZATION = {
  method: 'POST',
  path: ORGANIZATION_PATH,
  requires: [ Require.Authenticated ],
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  bodySchema: {
    ...ORGANIZATION_SCHEMA,
    required: []
  },
  on: async (request, response, { db, stripe }) => {
    const _id = new mongodb.ObjectID(request.params.organizationId);
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id });
    const operation = {
      $set: {
        ...request.body,
        lastUserActivity: new Date()
      }
    };

    if (request.body.stripe === null && organization.stripe) {
      await stripe.oauth.deauthorize({
        client_id: settings.stripe.client_id,
        stripe_user_id: organization.stripe.stripe_user_id
      });
    }

    await db.collection(OrganizationCollection)
      .updateOne({ _id }, operation);
    response.status(200).end();
  }
};

export const CREATE_ORGANIZATION = {
  method: 'POST',
  path: ORGANIZATIONS_PATH,
  requires: [ Require.Authenticated ],
  bodySchema: ORGANIZATION_SCHEMA,
  on: async (request, response, { db, jwt: { sub } }) => {
    const organization = new Organization();
    const ownerId = new mongodb.ObjectId(sub);
    organization.read = [ ownerId ];
    organization.email = request.body.email;
    organization.name = request.body.name;
    organization.emailVerified = false;
    organization.write = [ ownerId ];
    organization.owner = ownerId;
    organization.created = new Date();
    organization.lastUserActivity = new Date();

    await db.collection(OrganizationCollection).insertOne(organization);
    response.json({ _id: organization._id  });
  }
};

export const GET_ORGANIZATION = {
  method: 'GET',
  path: ORGANIZATION_PATH,
  accessRules: [
    {
      permission: Permission.READ,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  requires: [ Require.Authenticated ],
  on: async (request, response, { db }) => {
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.organizationId) });

    if (organization.stripe) {
      organization.stripe = {};
    }

    response.json(organization);
  }
};

export const INVITE_USER = {
  method: 'POST',
  path: INVITE_USER_TO_ORGANIZATION,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  pathSchema: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        format: 'objectId'
      }
    }
  },
  requires: [ Require.Authenticated ],
  on: async (request, response, { db }) => {
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.organizationId) });

    const userIdToInvite = new mongodb.ObjectID(request.body.userId);
    const exisitingInvitation = await db.collection(OrganizationInvitationCollection)
      .findOne({
        organizationId: organization._id,
        userId: userIdToInvite
      });

    if (exisitingInvitation !== null) {
      return response.status(409).end();
    }

    const invitation = new OrganizationInvitation();
    invitation.organizationId = organization._id;
    invitation.userId = userIdToInvite;
    invitation.created = new Date();

    await db.collection(OrganizationInvitationCollection)
      .insertOne(invitation);

    const entity = await db.collection(OrganizationInvitationCollection)
      .findOne({ organizationId: organization._id });

      response.json(entity);
  }
};

export const DELETE_USER = {
  method: 'DELETE',
  path: INVITE_USER_TO_ORGANIZATION,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  pathSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'objectId'
      }
    }
  },
  requires: [ Require.Authenticated ],
  on: async (request, response, { db, jwt }) => {
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.organizationId) });

    const requestUserId = new mongodb.ObjectID(jwt.sub);
    const userIdDeleting = new mongodb.ObjectID(request.params.userId);
    const isOwner = organization.owner.equals(requestUserId);
    const isDeletingOwner = organization.owner.equals(userIdDeleting);

    if (!isOwner) {
      return response.status(401).end();
    }

    if (isDeletingOwner) {
      return response.status(400).json({
        error: 'owner'
      }).end();
    }

    const newRead = organization.read.filter(id => !id.equals(userIdDeleting));
    const newWrite = organization.write.filter(id => !id.equals(userIdDeleting));

    const notFound = newRead.length === organization.read.length &&
      newWrite.length === organization.write.length;

    if (notFound) {
      return response.status(404).end();
    }

    const _id = new mongodb.ObjectID(request.params.organizationId);

    await db.collection(OrganizationCollection)
      .updateOne(
        { _id },
        {
          $pull: { read: userIdDeleting, write: userIdDeleting },
          $set: {
            lastUserActivity: new Date()
          }
        },
      );

    const entity = await db.findOne(OrganizationCollection)
      .findOne({ _id });

    response.json(entity);
  }
};

export const GET_ORGANIZATION_EVENTS = {
  method: 'GET',
  path: ORGANIZATION_EVENTS_PATH,
  accessRules: [
    {
      permission: Permission.READ,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  requires: [
    Require.Authenticated,
    Require.Page
  ],
  on: async (request, response, { db, pagination: { skip, limit } }) => {
    const cursor = await db.collection(EventCollection)
      .find({ organizationId: new mongodb.ObjectID(request.params.organizationId) })
      .skip(skip)
      .limit(limit);

    const countFuture = cursor.count();
    const eventsFuture = cursor.toArray();

    response.json({
      count: await countFuture,
      entity: await eventsFuture
    });
  }
};

export const ORGANIZATION_CONNECT_STRIPE = {
  method: 'GET',
  path: ORGANIZATION_STRIPE_CONNECT_PATH,
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'organizationId'
    }
  ],
  on: async (request, response, { db, stripe }) => {
    const organization = await db.collection(OrganizationCollection)
      .findOne({ _id: new mongodb.ObjectID(request.params.organizationId) });

    if (organization.stripe) {
      response.status(409).end();
      return;
    }

    const stripeResponse = await stripe.oauth.token({
       code: request.params.code,
       grant_type: 'authorization_code',
     });

    await db.collection(OrganizationCollection).updateOne({ _id: new mongodb.ObjectId(request.params.organizationId) }, {
      $set: {
        stripe: stripeResponse
      }
    });

    response.status(200).end();
  }
};
