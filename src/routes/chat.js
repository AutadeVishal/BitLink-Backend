const express = require("express");
const { Chat } = require("../models/chat");
const User = require('../models/user');
const userAuth = require('../middlewares/userAuth');

const chatRouter = express.Router();

const formatInboxItem = (chat, loggedInUser) => {
    const loggedInUserId = String(loggedInUser._id);
    const otherParticipant = (chat.participants || []).find(
        (participant) => String(participant._id || participant) !== loggedInUserId
    );

    const lastReadAt = chat.getUserLastReadAt(loggedInUser._id);
    let unreadCount = 0;

    (chat.messages || []).forEach((message) => {
        const senderId = String(message.senderId?._id || message.senderId);
        const createdAt = message.createdAt ? new Date(message.createdAt) : new Date(0);
        if (senderId !== loggedInUserId && createdAt > lastReadAt) {
            unreadCount += 1;
        }
    });

    const lastMessage = chat.messages?.[chat.messages.length - 1];
    const lastMessageSenderId = lastMessage ? String(lastMessage.senderId?._id || lastMessage.senderId) : null;
    const lastMessageSenderName = lastMessage
        ? (lastMessageSenderId === loggedInUserId ? loggedInUser.firstName : otherParticipant?.firstName || "User")
        : null;

    return {
        chatId: chat._id,
        userId: otherParticipant?._id,
        firstName: otherParticipant?.firstName || "Unknown",
        lastName: otherParticipant?.lastName || "User",
        photoURL: otherParticipant?.photoURL || "",
        unreadCount,
        lastMessageText: lastMessage?.text || "",
        lastMessageSenderName,
        lastMessageAt: lastMessage?.createdAt || chat.updatedAt
    };
};

chatRouter.get('/chat/inbox', userAuth, async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate({
                path: 'participants',
                select: 'firstName lastName photoURL'
            })
            .sort({ updatedAt: -1 });

        const inboxItems = chats
            .filter((chat) => (chat.participants || []).length > 1)
            .map((chat) => formatInboxItem(chat, req.user));

        return res.json({
            message: 'Inbox fetched',
            data: inboxItems
        });
    }
    catch (err) {
        console.log('Error in chat inbox route:', err.message);
        return res.status(500).json({ message: 'Error fetching inbox' });
    }
});

chatRouter.post('/chat/:targetUserId/read', userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const chat = await Chat.findOne({
            participants: { $all: [req.user._id, targetUserId] }
        });

        if (!chat) {
            return res.json({
                message: 'No chat found to mark as read',
                data: { unreadCount: 0 }
            });
        }

        chat.markUserAsRead(req.user._id, new Date());
        await chat.save();

        return res.json({
            message: 'Chat marked as read',
            data: { unreadCount: 0 }
        });
    }
    catch (err) {
        console.log('Error in mark-as-read route:', err.message);
        return res.status(500).json({ message: 'Error marking chat as read' });
    }
});

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const loggedInUser = req.user;
    try {
        let chat = await Chat.findOne({
            participants: { $all: [loggedInUser._id, targetUserId] }
        })
            ;
            
        if (!chat) {
            chat = new Chat({
                participants: [loggedInUser._id, targetUserId],
                messages: [],
                readReceipts: [
                    { userId: loggedInUser._id, lastReadAt: new Date() },
                    { userId: targetUserId, lastReadAt: new Date(0) }
                ]
            });
        }

        chat.markUserAsRead(loggedInUser._id, new Date());
        await chat.save();

        chat = await Chat.findById(chat._id)
            .populate({
                path: 'messages.senderId',
                select: 'firstName lastName'
            });

        const targetUser = await User.findById(targetUserId).select('firstName lastName photoURL');
        
        res.json({
            message: "Chat Of Users",
            data: {
                ...chat.toObject(),
                targetUser
            }
        });
    }
    catch (err) {
        console.log("Error in Chat Router:");
        console.log(err);
        res.status(500).json({ message: "Error fetching chat" });
    }
});
module.exports = { chatRouter };