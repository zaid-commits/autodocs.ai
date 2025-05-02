import { MongoClient } from 'mongodb';

// Extend the NodeJS.Global interface to include _mongoClientPromise
declare global {
  namespace NodeJS {
    interface Global {
      _mongoClientPromise?: Promise<MongoClient>;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across module reloads
  if (!(global as NodeJS.Global)._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    (global as NodeJS.Global)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as NodeJS.Global)._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

export default clientPromise;