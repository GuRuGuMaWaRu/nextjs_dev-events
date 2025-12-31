import "server-only";

import mongoose, { Mongoose } from "mongoose";

/**
 * MongoDB connection URI.
 *
 * Must be defined in the environment (e.g. .env.local) as MONGODB_URI.
 * We fail fast in development and production if it is missing.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Please set it in your environment configuration."
  );
}

/**
 * Shape of the cached Mongoose connection instance used across hot reloads.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the Node.js global object to include our Mongoose connection cache.
 *
 * In Next.js (especially in development with hot reloading), modules can be
 * re-evaluated multiple times. By storing the connection state on globalThis,
 * we avoid creating a new database connection on every reload.
 */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalCache: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = globalCache;
}

/**
 * Create (or reuse) a single Mongoose connection.
 *
 * - Reuses an existing connection if one is already established.
 * - Caches the connection promise to prevent creating multiple concurrent
 *   connections during server startup or hot reloads.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If we already have an active connection, return it immediately.
  if (globalCache.conn) {
    return globalCache.conn;
  }

  // If a connection is already in progress, reuse the same promise.
  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGODB_URI!, {
        // Use the modern connection string parser and topology engine.
        // These options are defaults in recent Mongoose versions but are
        // included here for clarity and explicitness.
        // You can add more options here if needed (e.g. readPreference).
        // Disable autoIndex in production to avoid rebuilding indexes on every connection,
        // which can degrade startup performance and cause issues with large collections.
        // Indexes should be managed via migrations/deployments in production.
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        // Reset the cached promise on failure so a future call can retry.
        globalCache.promise = null;
        throw error;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

/**
 * Convenience export of the underlying Mongoose instance type.
 *
 * This can be used when typing models or other helpers that work directly
 * with the Mongoose connection returned by connectToDatabase().
 */
export type DatabaseConnection = Mongoose;
