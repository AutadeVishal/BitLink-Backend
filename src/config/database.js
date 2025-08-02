const mongoose = require("mongoose");
const { mongoURL } =require("./constants")
const connectDB = async () => {
  try {
    await mongoose.connect(
      mongoURL
    );
    console.log("Database  connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
