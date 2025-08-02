const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(
      "what??"
    );
    console.log("Database  connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
//CodeMateAdmin1144
