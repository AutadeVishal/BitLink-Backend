const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://codemateAdmin:CodeMateAdmin1144@cluster0.fkuo33j.mongodb.net/codeMate"
    );
    console.log("Database  connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
//CodeMateAdmin1144
