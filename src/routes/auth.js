//Routes Specific to Authorisation Routers
const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");
const { normalizeSkillList } = require("../utils/skills");
const { BCRYPT_SALT_ROUNDS } = require("../config/constants.js");

const sanitizeUser = (userDocument) => {
  const plainUser = userDocument.toObject ? userDocument.toObject() : { ...userDocument };
  delete plainUser.password;
  return plainUser;
};

authRouter.post("/signup", async (req, res) => {
  try {
    await validateSignUpData(req.body); // Validate the input data
    const { firstName, lastName, email, password, age, gender, skills, photoURL } = req.body;
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender: gender.toLowerCase(),
      skills: normalizeSkillList(skills || []),
      photoURL
    });

    const insertedDocument = await newUser.save();
    const token = await insertedDocument.getJWT();
    res.cookie("token", token, { httpOnly: true });
    return res.json({
      message: "User created & logged in",
      data: sanitizeUser(insertedDocument)
    });
  } catch (err) {
    const msg = err.message || "Signup failed";
    const code = /exists|already/i.test(msg) ? 409 : 400;
    return res.status(code).json({ message: msg });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });
    const token = await user.getJWT();
    res.cookie("token", token, { httpOnly: true });
    return res.json({ message: "Logged in", data: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/logout", async (_req, res) => {
  res.cookie("token", null, { expires: new Date(0) });
  res.json({ message: "Logged out" });
});

module.exports = authRouter;
