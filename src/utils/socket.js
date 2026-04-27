const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const { Chat } = require('../models/chat');
const User = require('../models/user');
const { SECRET_KEY, BASE_URL } = require("../config/constants.js");

const getRoomId = (firstUserId, secondUserId) =>
  [firstUserId.toString(), secondUserId.toString()].sort().join("_");

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(cookieHeader.split(/; */).filter(Boolean).map(c => {
    const [k, ...v] = c.split("=");
    return [decodeURIComponent(k), decodeURIComponent(v.join("="))];
  }));

const initialiseSocket = (server) => {
  const io = socketIO(server, {
    cors: { origin: BASE_URL, credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await User.findById(decoded._id).select("firstName");
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.user._id.toString());

    socket.on("joinChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      const roomId = getRoomId(socket.user._id, targetUserId);
      socket.join(roomId);
    });

    socket.on("leaveChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      const roomId = getRoomId(socket.user._id, targetUserId);
      socket.leave(roomId);
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      const cleanedText = typeof text === "string" ? text.trim() : "";
      if (!cleanedText || !targetUserId) return;

      const loggedInUserId = socket.user._id;
      try {
        let chat = await Chat.findOne({ participants: { $all: [loggedInUserId, targetUserId] } });
        if (!chat) {
          chat = new Chat({
            participants: [loggedInUserId, targetUserId],
            messages: [],
            readReceipts: [
              { userId: loggedInUserId, lastReadAt: new Date() },
              { userId: targetUserId, lastReadAt: new Date(0) }
            ]
          });
        }

        const newMessage = { senderId: loggedInUserId, text: cleanedText };
        chat.messages.push(newMessage);
        chat.markUserAsRead(loggedInUserId, new Date());
        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];
        const roomId = getRoomId(loggedInUserId, targetUserId);

        io.to(roomId).emit("messageReceived", {
          text: savedMessage.text,
          firstName: socket.user.firstName,
          senderId: loggedInUserId.toString(),
          createdAt: savedMessage.createdAt
        });

        io.to(loggedInUserId.toString()).emit("inboxNeedsRefresh");
        io.to(String(targetUserId)).emit("inboxNeedsRefresh");
      } catch (err) {
        console.log("Error saving message:", err.message);
      }
    });
  });
};

module.exports = initialiseSocket;