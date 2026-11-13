import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("MONGO_URI is not defined");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached =
  globalForMongoose.mongooseCache ??
  (globalForMongoose.mongooseCache = {
    conn: null,
    promise: null,
  });

const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async () => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        // Each serverless instance keeps its own pool; a small cap and a short
        // idle time keep the total under the Atlas connection limit
        maxPoolSize: 10,
        maxIdleTimeMS: 10000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        tls: true,
      });
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connect attempt ${attempt} failed:`, error);
      // Drop the half-open client so the next attempt starts fresh
      await mongoose.disconnect().catch(() => {});
      if (attempt < MAX_ATTEMPTS) await sleep(300 * attempt);
    }
  }
  throw lastError;
};

export const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};
