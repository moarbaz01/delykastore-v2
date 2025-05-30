import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI!;
if (!MONGODB_URI) {
  throw new Error("MONGO_URI is not defined");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const dbConnect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevent command buffering
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      tls: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};
