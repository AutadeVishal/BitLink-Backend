//Routes Specific to Authorisation Routers
const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const dummydata=require('./dummy_users_100.js')
const { validateSignUpData } = require("../utils/validation");
authRouter.post("/signup", async (req, res) => {
  try {
    await validateSignUpData(req.body); // Validate the input data
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const { firstName, lastName, email, password, age, gender, skills ,profileURL} =
      req.body;

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new Error("User With This Email Id Already Exists:");
    }
    

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
      skills,
      profileURL
    });
    const insertedDocument = await newUser.save();
    console.log(" User created:", insertedDocument);

   return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error in /signup:", err.message);
   return res.status(501).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User Not Found");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid Password");
    }
    const token = await user.getJWT();
    res.cookie("token", token);
    console.log("User logged in:", user.email);
    return res.send(user);
  } catch (err) {
    console.error("Error in /login:", err.message);
    return res.status(400).send(err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  console.log("User Logged Out");
  res.send("Log Out SuccessFully");
});
module.exports = authRouter;
