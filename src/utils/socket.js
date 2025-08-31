const socket = require("socket.io");
const { Chat } = require('../models/chat')
const BASE_URL=process.env.BASE_URL;
const initialiseSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin:BASE_URL,
        },
    })

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ targetUserId, loggedInUserId, name }) => {

            const roomId = [loggedInUserId, targetUserId].sort().join("_");
            console.log(loggedInUserId)
            socket.join(roomId);

            console.log(name, "Joined", roomId)
        });

        socket.on("sendMessage", async ({ firstName, loggedInUserId, targetUserId, text }) => {


            // saving message to databse
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [loggedInUserId, targetUserId] }
                });
                if (!chat) {
                    chat = new Chat({
                        participants: [loggedInUserId, targetUserId],
                        messages: []
                    })
                }
                
                const newMessage = {
                    senderId: loggedInUserId,
                    text,
                };
                
                chat.messages.push(newMessage);
                await chat.save();

                const roomId = [loggedInUserId, targetUserId].sort().join("_");
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                io.to(roomId).emit("messageReceived", { 
                    text, 
                    firstName,
                    timestamp
                });
                console.log(`${firstName} said ${text}`)
            }
            catch (err) {
                console.log("Error Occured in Saving Message:")
                console.log(err)
            }
        });


        socket.on("disconnect", () => {

        });
    });
}

module.exports = initialiseSocket;