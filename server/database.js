import mongodb from 'mongodb';
import { settings } from 'settings';
import { EntityType } from 'common/models';

export const getDatabase = () => {
  return new Promise(async (resolve, reject) => {
    mongodb.MongoClient.connect(settings.mongo.url, { useNewUrlParser: true }, async (err, client) => {
      if (err) {
        reject(err);
      } else {
        const db = client.db('jivecake');
        const userCollection = db.collection(EntityType.User);
        await userCollection.createIndex({email: 1}, { unique:true });

        resolve(db);
      }
    });
  });
};
