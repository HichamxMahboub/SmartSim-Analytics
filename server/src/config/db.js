const mongoose = require("mongoose");

async function connectDb() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smartsim_analytics";

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDb;

