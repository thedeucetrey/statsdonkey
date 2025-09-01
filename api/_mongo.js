// Reuse a single MongoDB connection across calls
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // <-- set in Vercel (do NOT paste in code)
if (!uri) throw new Error('MONGODB_URI is not set');

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {});
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
