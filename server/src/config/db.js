const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb://localhost:27017/smartsim_analytics";

async function connectDb() {
  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
  });

  console.log("MongoDB connected");
  return mongoose.connection;
}

module.exports = connectDb;

