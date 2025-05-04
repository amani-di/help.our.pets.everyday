import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
 
if (!MONGODB_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

     
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;