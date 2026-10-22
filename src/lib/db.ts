import mongoose, { type Model, type Schema } from "mongoose";

// Reuse one connection across hot reloads and requests.
const cache = globalThis as unknown as { mongoose?: Promise<typeof mongoose> };

export function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  cache.mongoose ??= mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "ceylon-vanilla", serverSelectionTimeoutMS: 10_000 })
    .catch((e) => { cache.mongoose = undefined; throw e; });
  return cache.mongoose;
}

// Registers a model, replacing any copy cached by a previous hot reload so schema changes take effect.
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  if (mongoose.models[name]) mongoose.deleteModel(name);
  return mongoose.model<T>(name, schema);
}
