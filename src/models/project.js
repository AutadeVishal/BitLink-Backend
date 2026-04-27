const mongoose = require("mongoose");
const { PROJECT_TYPES } = require("../constants/projectTypes");

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: PROJECT_TYPES,
      default: "other"
    },
    skillsUsed: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ ownerId: 1, type: 1 });
projectSchema.index({ skillsUsed: 1 });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;