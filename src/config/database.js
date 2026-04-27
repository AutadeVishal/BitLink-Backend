const mongoose = require("mongoose");
const { MONGO_URL } = require('./constants.js');
const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGO_URL
    );
    console.log("Database  connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
