const express = require("express");
const { Chat } = require("../models/chat");
const userAuth = require('../middlewares/userAuth')

const chatRouter = express.Router();


chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const loggedInUser = req.user;
    try {
        let chat = await Chat.findOne({
            participants: { $all: [loggedInUser._id, targetUserId] }
        })
            .populate(
                {
                    path: "messages.senderId",
                    select: "firstName lastName createdAt "
                }
            );
            
        if (!chat) {
            chat = new Chat({
                participants: [loggedInUser._id, targetUserId],
                messages: []
            });
            await chat.save();
            // Populate after saving
            chat = await Chat.findById(chat._id).populate({
                path: "messages.senderId",
                select: "firstName lastName createdAt"
            });
        }
        
        res.json({
            message: "Chat Of Users",
            data: chat
        })
    }
    catch (err) {
        console.log("Error in Chat Router:");
        console.log(err);
        res.status(500).json({ message: "Error fetching chat" });
    }
})
module.exports = { chatRouter };