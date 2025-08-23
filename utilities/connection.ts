import mongoose from "mongoose";

let isConnected = false; // Track connection state

export const connectMongo = async () => {
  if (isConnected) {
    // If already connected, just reuse it
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    // Check if MONGODB_URL is defined
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }

    const db = await mongoose.connect(process.env.MONGODB_URL);

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
};
