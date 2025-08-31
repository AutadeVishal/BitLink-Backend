const validator = require("validator");
const User = require("../models/user");

const validateSignUpData = async (data) => {
  const { firstName, lastName, email, password, age, gender } = data;

  if (!firstName || !lastName || !email || !password || age === undefined || !gender) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
  const ageNum = Number(age);
  if (isNaN(ageNum) || ageNum < 18) {
    throw new Error("Age must be a number >= 18");
  }
  const allowedGenders = ["male", "female", "other"];
  if (!allowedGenders.includes(gender.toLowerCase())) {
    throw new Error("Invalid gender");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }
};

const validateEditProfileData = async (data) => {
  const allowedEditFields = ["firstName", "lastName", "age", "skills", "about", "photoURL", "password"];
  const isEditAllowed = Object.keys(data).every(k => allowedEditFields.includes(k));
  if (!isEditAllowed) return false;
  if (data.password && !validator.isStrongPassword(data.password)) {
    throw new Error("Password is not strong enough");
  }
  if (data.age !== undefined) {
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum < 18) {
      throw new Error("Age must be a number >= 18");
    }
  }
  return true;
};

module.exports = { validateEditProfileData, validateSignUpData };
