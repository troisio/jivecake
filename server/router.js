import { hasAccess } from './access';

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

const isAuthorized = async (req) => {
  if (req.headers.authorization) {
    return req.headers.authorization.startsWith('Bearer ');
  }

  return false;
}

const deriveUserFromRequest = (req) => {
  console.log(req.headers);

  return Promise.resolve({
    _id: ''
  });
}

const hasAccessRules = async (accessRules, req) => {
  for (const { permission, entityType, param } of accessRules) {
    const read = permission === Permission.READ;
    const write = permission === Permission.READ;
    const { _id } = await deriveUserFromRequest(req);
    const passes = hasAccess({}, read, write, entityType, req.params[param], _id);

    if (!passes) {
      return false;
    }
  }

  return true;
};

export const register = async (app, settings) => {
  app.get(settings.path, async (req, res) => {
    const requires = settings.hasOwnProperty('requires') ? settings.requires : [];
    const accessRules = settings.hasOwnProperty('accessRules') ? settings.accessRules : [];
    let passesAuthentication = true;
    let passesAccessRules;

    if (requires.includes(Require.Authenticated)) {
      passesAuthentication = await isAuthorized(req);
    }

    if (accessRules.length === 0) {
      passesAccessRules = true;
    } else if (passesAuthentication) {
      passesAccessRules = await hasAccessRules(accessRules, req);
    } else {
      passesAccessRules = false;
    }

    if (!passesAuthentication || !passesAccessRules) {
      res.send(403);
    }

    res.json({ nice: 2 });
  });
}
