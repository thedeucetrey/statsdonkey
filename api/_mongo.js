// Reuses a single MongoDB connection across invocations
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // set in Vercel
if (!uri) throw new Error('MONGODB_URI is not set');

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {});
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
