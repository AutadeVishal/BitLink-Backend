const express = require('express');
const profileRouter = express.Router();
const User = require('../models/user.js');
const { validateEditProfileData } = require('../utils/validation.js');
const userAuth = require('../middlewares/userAuth.js');
const bcrypt = require('bcrypt');
const { normalizeSkillList } = require('../utils/skills.js');
const { BCRYPT_SALT_ROUNDS } = require('../config/constants.js');

const sanitizeUser = (userDocument) => {
  const plainUser = userDocument.toObject ? userDocument.toObject() : { ...userDocument };
  plainUser.skills = normalizeSkillList(plainUser.skills, 5);
  delete plainUser.password;
  return plainUser;
};


profileRouter.get('/view', userAuth, async (req, res) => {
  try {
    return res.json({ message: "User Found", data: sanitizeUser(req.user) });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});



profileRouter.patch('/edit', userAuth, async (req, res) => {
  try {
    const data = req.body || {};
    const allowed = await validateEditProfileData(data);
    if (!allowed) {
      return res.status(400).json({ message: "Not allowed to edit supplied fields" });
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    }
    if (data.skills !== undefined) {
      data.skills = normalizeSkillList(data.skills, 5);
    }
    const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true });
    return res.json({ message: "Profile updated", data: sanitizeUser(user) });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Update failed" });
  }
});
module.exports = profileRouter;