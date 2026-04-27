const express = require('express');
const userRouter = express.Router();
const connectionRequestModel = require('../models/connectionRequest.js');
const userAuth = require('../middlewares/userAuth.js');
const User = require("../models/user.js");
const Project = require("../models/project.js");
const { PROJECT_TYPES } = require('../constants/projectTypes.js');
const { normalizeSkillList, toSkillNameList } = require('../utils/skills.js');

const USER_CARD_FIELDS = 'firstName lastName skills about photoURL age email gender';

const parseCsv = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const formatUser = (userDocument, projectTypeMap = new Map()) => {
    const user = userDocument.toObject ? userDocument.toObject() : { ...userDocument };
    user.skills = normalizeSkillList(user.skills, 5);
    user.projectTypes = Array.from(projectTypeMap.get(String(user._id)) || []);
    delete user.password;
    return user;
};

const buildSkillCondition = (skillNames, minSkillLevel, maxSkillLevel) => {
    if (!skillNames.length) {
        return null;
    }

    const skillRegexes = skillNames.map((skillName) => new RegExp(`^${escapeRegex(skillName)}$`, 'i'));

    const conditions = [
        {
            skills: {
                $elemMatch: {
                    name: { $in: skillRegexes },
                    level: { $gte: minSkillLevel, $lte: maxSkillLevel }
                }
            }
        }
    ];

    if (minSkillLevel <= 5 && maxSkillLevel >= 5) {
        conditions.push({ skills: { $in: skillRegexes } });
    }

    return { $or: conditions };
};


//interested candidates
userRouter.get('/view', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;


        const connectionRequests = await connectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "skills", "about", "photoURL", "age", "email", "gender"]);


        if (connectionRequests.length === 0) {
            return res.json({
                message: `No Pending Connections`,
                data: []
            });
        }
        const data = connectionRequests.map((row) => formatUser(row.fromUserId));
        return res.json({
            message: `Interested Pending Candidates are`,
            data: data
        });
    } catch (err) {
        console.error("Error fetching connection requests:", err.message);
        res.status(500).send("An error occurred while fetching connection requests");
    }
});

// Get all the connections for the logged-in user
userRouter.get('/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;


        const connectedUsers = await connectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        })
            .populate("fromUserId", ["firstName", "lastName", "skills", "about", "photoURL", "age", "gender", "email"])
            .populate("toUserId", ["firstName", "lastName", "skills", "about", "photoURL", "age", "gender", "email"]);


        const connections = connectedUsers.map((connection) => {
            if (connection.fromUserId._id.toString() === loggedInUser._id.toString()) {

                return formatUser(connection.toUserId);
            } else {

                return formatUser(connection.fromUserId);
            }
        });

        return res.json({
            message: `Your Connections`,
            data: connections
        });
    } catch (err) {
        console.error("Error fetching connections:", err.message);
        res.status(500).send("Not Able to Get Connections");
    }
});


userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;

        page = Math.max(1, page);
        limit = Math.max(1, Math.min(50, limit));

        const search = String(req.query.search || '').trim();
        const minAge = parseNumber(req.query.minAge);
        const maxAge = parseNumber(req.query.maxAge);
        const selectedGenders = parseCsv(req.query.genders || req.query.gender)
            .map((gender) => gender.toLowerCase())
            .filter(Boolean);
        const selectedProjectTypes = parseCsv(req.query.projectTypes)
            .map((type) => type.toLowerCase())
            .filter((type) => PROJECT_TYPES.includes(type));

        const explicitSkillNames = parseCsv(req.query.skills);

        const minSkillLevelRaw = parseNumber(req.query.minSkillLevel);
        const maxSkillLevelRaw = parseNumber(req.query.maxSkillLevel);
        const minSkillLevel = Math.max(1, Math.min(10, minSkillLevelRaw ?? 1));
        const maxSkillLevel = Math.max(minSkillLevel, Math.min(10, maxSkillLevelRaw ?? 10));

        const connectionRequests = await connectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((requestDoc) => {
            hideUsersFromFeed.add(requestDoc.fromUserId);
            hideUsersFromFeed.add(requestDoc.toUserId);
        });

        const andConditions = [
            { _id: { $nin: Array.from(hideUsersFromFeed) } },
            { _id: { $ne: loggedInUser._id } }
        ];

        if (search) {
            const searchRegex = new RegExp(escapeRegex(search), 'i');
            andConditions.push({
                $or: [
                    { firstName: { $regex: searchRegex } },
                    { lastName: { $regex: searchRegex } }
                ]
            });
        }

        if (minAge !== null || maxAge !== null) {
            const ageFilter = {};
            if (minAge !== null) {
                ageFilter.$gte = minAge;
            }
            if (maxAge !== null) {
                ageFilter.$lte = maxAge;
            }
            andConditions.push({ age: ageFilter });
        }

        if (selectedGenders.length > 0) {
            andConditions.push({ gender: { $in: selectedGenders } });
        }

        if (selectedProjectTypes.length > 0) {
            const ownerIds = await Project.find({ type: { $in: selectedProjectTypes } }).distinct('ownerId');
            if (ownerIds.length === 0) {
                return res.json({
                    message: 'Feed',
                    data: [],
                    meta: { page, limit, count: 0 }
                });
            }
            andConditions.push({ _id: { $in: ownerIds } });
        }

        let skillNamesForFilter = explicitSkillNames;
        if (skillNamesForFilter.length === 0) {
            skillNamesForFilter = toSkillNameList(loggedInUser.skills || []);
        }

        const skillCondition = buildSkillCondition(skillNamesForFilter, minSkillLevel, maxSkillLevel);
        if (skillCondition) {
            andConditions.push(skillCondition);
        }

        const usersToShow = await User.find({ $and: andConditions })
            .select(USER_CARD_FIELDS)
            .skip((page - 1) * limit)
            .limit(limit);

        const userIds = usersToShow.map((user) => user._id);
        const projectTypeMap = new Map();

        if (userIds.length > 0) {
            const relatedProjects = await Project.find({ ownerId: { $in: userIds } }).select('ownerId type');
            relatedProjects.forEach((project) => {
                const key = String(project.ownerId);
                const currentSet = projectTypeMap.get(key) || new Set();
                currentSet.add(project.type);
                projectTypeMap.set(key, currentSet);
            });
        }

        const formattedUsers = usersToShow.map((user) => formatUser(user, projectTypeMap));

        res.json({
            message: 'Feed',
            data: formattedUsers,
            meta: {
                page,
                limit,
                count: formattedUsers.length
            }
        });
    } catch (err) {
        console.log('Some Error In /feed:', err.message);
        res.status(400).json({ message: err.message || 'Error occurred' });
    }
});
module.exports = userRouter;