import mongodb from 'mongodb';
import { settings } from 'settings';

export const UserCollection = 'user';
export const EventCollection = 'event';
export const ItemCollection = 'item';
export const OrganizationCollection = 'organization';
export const PaymentProfileCollection = 'paymentProfile';
export const TransactionCollection = 'transaction';

export const getDatabase = () => {
  return new Promise(async (resolve, reject) => {
    mongodb.MongoClient.connect(settings.mongo.url, { useNewUrlParser: true }, async (err, client) => {
      if (err) {
        reject(err);
      } else {
        const db = client.db('jivecake');

        const userCollection = db.collection(UserCollection);
        await userCollection.createIndex({email: 1}, { unique:true });

        const eventCollection = db.collection(EventCollection);
        await eventCollection.createIndex({ organization: 1 });

        const paymentProfileCollection = db.collection(PaymentProfileCollection);
        await paymentProfileCollection.createIndex({ organization: 1 });

        const itemCollection = db.collection(ItemCollection);
        await itemCollection.createIndex({ eventId: 1 });

        const transactionCollection = db.collection(TransactionCollection);
        await transactionCollection.createIndex({ eventId: 1 });
        await transactionCollection.createIndex({ userId: 1 });

        resolve(db);
      }
    });
  });
};