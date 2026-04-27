const express = require("express");
const projectRouter = express.Router();
const userAuth = require("../middlewares/userAuth");
const User = require("../models/user");
const Project = require("../models/project");
const { PROJECT_TYPES } = require("../constants/projectTypes");
const { mergeSkillsWithBaseLevel, normalizeSkillList } = require("../utils/skills");

const sanitizeUser = (userDocument) => {
  const plainUser = userDocument.toObject ? userDocument.toObject() : { ...userDocument };
  delete plainUser.password;
  return plainUser;
};

projectRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { title, description, type, skillsUsed } = req.body || {};

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const normalizedType = typeof type === "string" ? type.trim().toLowerCase() : "";

    if (!normalizedTitle || !normalizedDescription || !normalizedType) {
      throw new Error("Title, description, and project type are required");
    }

    if (!PROJECT_TYPES.includes(normalizedType)) {
      throw new Error("Invalid project type");
    }

    if (!Array.isArray(skillsUsed)) {
      throw new Error("skillsUsed must be an array");
    }

    const normalizedSkills = normalizeSkillList(skillsUsed, 5).map((skill) => skill.name);
    if (normalizedSkills.length === 0) {
      throw new Error("Add at least one skill used in the project");
    }

    const project = await Project.create({
      ownerId: req.user._id,
      title: normalizedTitle,
      description: normalizedDescription,
      type: normalizedType,
      skillsUsed: normalizedSkills
    });

    const user = await User.findById(req.user._id);
    user.skills = mergeSkillsWithBaseLevel(user.skills, normalizedSkills, 5);
    await user.save();

    return res.status(201).json({
      message: "Project created successfully",
      data: {
        project,
        user: sanitizeUser(user)
      }
    });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Unable to create project" });
  }
});

projectRouter.get("/mine", userAuth, async (req, res) => {
  try {
    const projects = await Project.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      message: "Projects fetched",
      data: projects
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Unable to fetch projects" });
  }
});

module.exports = projectRouter;