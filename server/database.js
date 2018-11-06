import mongodb from 'mongodb';

export const getDatabase = () => {
  return new Promise((resolve, reject) => {
    mongodb.MongoClient.connect('mongodb://mongo:27017', { useNewUrlParser: true }, async (err, client) => {
      if (err) {
        return reject(err);
      }
      const db = client.db('jivecake');
      resolve(db);
    });
  });
};
