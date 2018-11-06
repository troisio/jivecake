import Logger from 'logger';
import { EntityType } from 'common';

export const hasAccess = (db, read, write, entityType, id, userId) => {
  db.collection(entityType).findOne({ id }).then((document) => {
    if (entityType === EntityType.User) {
      return userId = document._id;
    }

    if (document.hasOwnProperty('organizationId')) {
      return this.db.collection(EntityType.Organization).findOne({ id: document.organizationId }).then((organization) => {
        const passesRead = !read || organization.read.includes(userId);
        const passesWrite = !write || organization.write.includes(userId);
        return passesRead && passesWrite;
      }, (e) => {
        Logger.logError(e);
      })
    }

    return false;
  }, (e) => {
    Logger.logError(e);
  });
}
