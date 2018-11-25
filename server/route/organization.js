import mongodb from 'mongodb';

import { Method, Require, Permission } from 'router';
import { EventCollection, OrganizationCollection, OrganizationInvitationCollection } from 'database';
import { Organization, OrganizationInvitation } from 'common/models';
import { DEFAULT_MAX_LENGTH } from 'common/schema';

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
    organization.owner = ownerId;
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

export const INVITE_USER = {
  method: Method.POST,
  path: '/organization/:organizationId/user/:userId',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'id'
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
      return response.sendStatus(409).end();
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
}

export const DELETE_USER = {
  method: Method.DELETE,
  path: '/organization/:organizationId/user/:userId',
  accessRules: [
    {
      permission: Permission.WRITE,
      collection: OrganizationCollection,
      param: 'id'
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
      return response.sendStatus(401).end();
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
      return response.sendStatus(404).end();
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
