import jwt from 'jsonwebtoken';
import jwtkeypub from 'extra/jwt/jwt.key.pub';

import { EntityType } from 'common/models';

export class Require {
  Authenticated = 'authenticated'
}

export const Method = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
};

export const Permission = {
  READ: 0,
  WRITE: 0,
};

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
  }

  static getJWT(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtkeypub, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          console.log('err', err);
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
      console.log('registered invalid route method with ' + settings);
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
        console.log('accessRules, req', accessRules, req);

        passesAccessRules = await this.hasAccessRules(accessRules, req);
      } else {
        passesAccessRules = false;
      }

      if (!passesAuthentication || !passesAccessRules) {
        res.sendStatus(403).end();
      } else if (settings.hasOwnProperty('on')) {
        let decodedJwt = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
          const token = req.headers.authorization.substring('Bearer ');
          try {
            decodedJwt = await Router.getJWT(token);
          } catch (_e) {
            this.sentry.captureMessage('invalid token attempted');
          }
        }

        try {
          settings.on(req, res, { db: this.db, jwt: decodedJwt });
        } catch (e) {
          this.sentry.captureException(e);
          res.sendStatus(500).end();
        }
      } else {
        res.sendStatus(200).end();
      }
    })
  }

  hasAccess(read, write, entityType, id, userId) {
    return this.db.collection(entityType).findOne({ id }).then((document) => {
      if (entityType === EntityType.User) {
        return userId === document._id;
      }

      if (document.hasOwnProperty('organizationId')) {
        return this.db.collection(EntityType.Organization).findOne({ id: document.organizationId }).then((organization) => {
          const passesRead = !read || organization.read.includes(userId);
          const passesWrite = !write || organization.write.includes(userId);
          return passesRead && passesWrite;
        }, (e) => {
          this.sentry.captureException(e);
          return false;
        })
      }

      return false;
    }, (e) => {
      console.log(e);
      return false;
    });
  }

  async hasAccessRules(accessRules, req) {
    const decodedJWT = await decodedJWTFromRequest(req);

    if (decodedJWT === null) {
      return accessRules.length === 0;
    }

    for (const { permission, entityType, param } of accessRules) {
      const read = permission === Permission.READ;
      const write = permission === Permission.READ;
      const passes = this.hasAccess(read, write, entityType, req.params[param], decodedJWT.sub);

      if (!passes) {
        return false;
      }
    }

    return true;
  }
}
