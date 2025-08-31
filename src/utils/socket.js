const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const { Chat } = require('../models/chat');
const User = require('../models/user');
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = process.env.BASE_URL;

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

    socket.on("joinChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      const roomId = [socket.user._id.toString(), targetUserId].sort().join("_");
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      if (!text || !targetUserId) return;
      const loggedInUserId = socket.user._id;
      try {
        let chat = await Chat.findOne({ participants: { $all: [loggedInUserId, targetUserId] } });
        if (!chat) {
          chat = new Chat({ participants: [loggedInUserId, targetUserId], messages: [] });
        }
        const newMessage = { senderId: loggedInUserId, text };
        chat.messages.push(newMessage);
        await chat.save();
        const roomId = [loggedInUserId.toString(), targetUserId].sort().join("_");
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        io.to(roomId).emit("messageReceived", {
          text,
            firstName: socket.user.firstName,
          timestamp
        });
      } catch (err) {
        console.log("Error saving message:", err.message);
      }
    });
  });
};

module.exports = initialiseSocket;