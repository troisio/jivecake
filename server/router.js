import Ajv from 'ajv';
import jwt from 'jsonwebtoken';
import mongodb from 'mongodb';
import jwtkeysecret from 'extra/jwt/jwt.key';

import { OrganizationCollection, UserCollection } from './database';

export const DEFAULT_LIMIT = 500;
export const LIMIT_MAX = 1000;

export class Require {
  static Authenticated = 'authenticated';
  static Page = 'page';
}

export const Method = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
};

export class Permission {
  static READ = 0;
  static WRITE = 1;
}

const decodedJWTFromRequest = (req) => {
  return new Promise(async (resolve) => {
    if (req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        const token = req.headers.authorization.substring('Bearer '.length)
        try {
          const decodedJWT = await Router.getJWT(token);
          resolve(decodedJWT);
        } catch (_e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });
}

export class Router {
  constructor(application, sentry, db) {
    this.application = application;
    this.sentry = sentry;
    this.db = db;
    this.ajv = new Ajv();
    this.ajv.addFormat('objectid', /^[a-f\d]{24}$/i);
  }

  static getJWT(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtkeysecret, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  register(settings) {
    let method = () => {};

    if (settings.method === Method.POST) {
      method = this.application.post.bind(this.application);
    } else if (settings.method === Method.DELETE) {
      method = this.application.delete.bind(this.apfplication);
    } else if (settings.method === Method.GET) {
      method = this.application.get.bind(this.application);
    } else {
      this.sentry.captureMessage('registered invalid route method with ' + settings);
    }

    method(settings.path, async (req, res) => {
      const requires = settings.hasOwnProperty('requires') ? settings.requires : [];
      const accessRules = settings.hasOwnProperty('accessRules') ? settings.accessRules : [];
      let passesAuthentication = true;
      let passesAccessRules;

      if (requires.includes(Require.Authenticated)) {
        const decodedJWT = await decodedJWTFromRequest(req);
        passesAuthentication = decodedJWT !== null;
      }

      if (accessRules.length === 0) {
        passesAccessRules = true;
      } else if (passesAuthentication) {
        passesAccessRules = await this.hasAccessRules(accessRules, req);
      } else {
        passesAccessRules = false;
      }

      if (!passesAuthentication || !passesAccessRules) {
        res.sendStatus(401).end();
      } else if (settings.hasOwnProperty('on')) {
        let decodedJwt = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
          const token = req.headers.authorization.substring('Bearer '.length);
          try {
            decodedJwt = await Router.getJWT(token);
          } catch (_e) {
            this.sentry.captureMessage('invalid token attempted');
          }
        }

        const extra = { db: this.db, jwt: decodedJwt, sentry: this.sentry };

        if (requires.includes(Require.Page)) {
          extra.pagination = { limit: DEFAULT_LIMIT };

          const validLimit = req.query.hasOwnProperty('page') &&
            typeof req.query.limit === 'string' &&
            req.limit.length > 0;

          if (validLimit) {
            const limit = Number(req.query.limit);

            if (Number.isInteger(limit) && limit > -1 && limit < LIMIT_MAX) {
              extra.pagination.limit = limit;
            } else {
              return res.sendStatus(400).end();
            }
          }

          const validPage = req.query.hasOwnProperty('page') &&
            typeof req.query.page === 'string' &&
            req.query.page.length > 0;

          if (validPage) {
            const page = Number(req.query.page);

            if (Number.isInteger(page) && page > -1) {
              extra.pagination.page = page;
              extra.pagination.skip = extra.pagination.limit * page;
            } else {
              return res.sendStatus(400).end();
            }
          } else {
            return res.sendStatus(400).end();
          }
        }

        try {
          const passesSchemaValidation = this.passesBodySchema(req, settings);
          const passesQuerySchemaValidation = this.passesQuerySchema(req, settings);
          const passesPathSchema = this.passesPathSchema(req, settings);
          const valid = passesSchemaValidation && passesQuerySchemaValidation && passesPathSchema;

          if (valid) {
            const promise = settings.on(req, res, extra);

            if (typeof promise !== 'undefined' && 'then' in promise) {
              promise.then(() => {}, (e) => {
                this.sentry.captureException(e);
                res.sendStatus(500).end();
              });
            }
          } else {
            res.sendStatus(400).end();
          }
        } catch (e) {
          this.sentry.captureException(e);
          res.sendStatus(500).end();
        }
      } else {
        res.sendStatus(200).end();
      }
    })
  }

  passesBodySchema(request, settings) {
    let passes = true;

    if (settings.hasOwnProperty('bodySchema')) {
      const validate = this.ajv.compile(settings.bodySchema);
      passes = typeof request.body === 'object' ? validate(request.body) : false;
    }

    return passes;
  }

  passesPathSchema(request, settings) {
    let passes = true;

    if (settings.hasOwnProperty('pathSchema')) {
      const validate = this.ajv.compile(settings.pathSchema);
      passes = typeof request.body === 'object' ? validate(request.params) : false;
    }

    return passes;
  }

  passesQuerySchema(request, settings) {
    let passes = true;

    if (settings.hasOwnProperty('querySchema')) {
      const validate = this.ajv.compile(settings.querySchema);
      passes = typeof request.query === 'object' ? validate(request.query) : false;
    }

    return passes;
  }

  async hasAccess(read, write, collection, _id, userId) {
    const document = await this.db.collection(collection).findOne({ _id });

    if (document === null) {
      return false;
    }

    if (collection === UserCollection) {
      return userId.equals(document._id);
    }

    if (collection === OrganizationCollection) {
      const passesRead = !read || document.read.some(objectId => objectId.equals(userId));
      const passesWrite = !write || document.write.some(objectId => objectId.equals(userId));
      return passesRead && passesWrite;
    }

    if (document.hasOwnProperty('organizationId')) {
      const organization = await this.db.collection(OrganizationCollection).findOne({ _id: document.organizationId });

      if (organization === null) {
        this.sentry.captureMessage(`has access check with bad organization id ${document.organizationId} from ${collection} ${_id}` );
        return false;
      }

      const passesRead = !read || organization.read.some(objectId => objectId.equals(userId));
      const passesWrite = !write || organization.write.some(objectId => objectId.equals(userId));
      return passesRead && passesWrite;
    }

    return false;
  }

  async hasAccessRules(accessRules, req) {
    const decodedJWT = await decodedJWTFromRequest(req);

    if (decodedJWT === null) {
      return accessRules.length === 0;
    }

    for (const { permission, collection, param } of accessRules) {
      const read = permission === Permission.READ;
      const write = permission === Permission.WRITE;
      try {
        const objectId = new mongodb.ObjectID(req.params[param]);
        const userId = new mongodb.ObjectID(decodedJWT.sub);
        const passes = await this.hasAccess(read, write, collection, objectId, userId);

        if (!passes) {
          return false;
        }
      } catch (_e) {
        return false;
      }
    }

    return true;
  }
}