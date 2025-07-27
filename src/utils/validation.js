const validator = require("validator");
const User = require("../models/User");

const validateSignUpData = async (data) => {
  const { firstName, lastName, email, password } = data;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  }

  if (firstName.length < 4 || lastName.length < 4) {
    throw new Error("First and last name must be at least 4 characters long");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }//is checked at schema level but still doing it for learning purpose

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
};
const validateEditProfileData=async (data)=>{
const allowedEditFields=["firstName","lastName","age","skills","about"];
const isEditAllowed=Object.keys(data).every(k=>allowedEditFields.includes(k));
return isEditAllowed;
}
module.exports = {validateEditProfileData,validateSignUpData};
