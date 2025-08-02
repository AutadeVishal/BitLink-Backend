const validator = require("validator");
const User = require("../models/user");

const validateSignUpData = async (data) => {
  const { firstName, lastName, email, password } = data;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }
};
const validateEditProfileData=async (data)=>{
const allowedEditFields=["firstName","lastName","age","skills","about","profileURL","password"];
const isEditAllowed=Object.keys(data).every(k=>allowedEditFields.includes(k));
return isEditAllowed;
}
module.exports = {validateEditProfileData,validateSignUpData};
