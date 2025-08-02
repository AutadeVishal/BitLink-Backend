const mongoose = require("mongoose");
const isvalidemail = require("validator").isEmail;
const isvalidpassword = require("validator").isStrongPassword;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config/constants");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      maxlength: 50,
      minLength: 2,
    },
    lastName: { type: String, required: true, maxlength: 50, minLength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        //unique:true automatically does index:true
        if (!isvalidemail(value)) {
          throw new Error("Type Correct Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate(value) {
        if (!isvalidpassword(value)) {
          throw new Error("Password Not Strong Enough");
        }
      },
    },
    age: { type: Number, required: true, min: 18 },
    gender: {
      type: String,
      required: true,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is Not a Valid Gender Type`,
      },

    },
    about: {
      type: String,
      default: "Description Not Available",
      maxlength: 300,
    },
    skills: { type: [String] },
    photoURL: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png"
    }
  },
  {
    timestamps: true,
  }
);
userSchema.methods.getJWT = function () {
  // const token=await jwt.sign({password:this.password},"1234");
  const token = jwt.sign({ _id: this._id }, SECRET_KEY, { expiresIn: "1h" });
  return token;
};
userSchema.methods.validatePassword = async function (password) {
  const isPasswordValid = await bcrypt.compare(password, this.password);
  return isPasswordValid; // Return the result
};
module.exports = mongoose.model("User", userSchema);
