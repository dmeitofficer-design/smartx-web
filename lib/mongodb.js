import mongoose from 'mongoose';
import dns from 'node:dns/promises';
if (typeof window === 'undefined') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartx_web';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
