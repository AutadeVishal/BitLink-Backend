const socket = require("socket.io")
const initialiseSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    })

    io.on("connection", (socket) => {
        socket.on("joinChat",({targetUserId,loggedInUserId,name})=>{
            const roomId=[loggedInUserId,targetUserId].sort().join("_");
            console.log(loggedInUserId)
            socket.join(roomId);
            console.log(name,"Joined",roomId)
        });

        socket.on("sendMessage",({firstName,loggedInUserId,targetUserId,text})=>{
            
            const roomId=[loggedInUserId,targetUserId].sort().join("_");
            io.to(roomId).emit("messageReceived",{text,firstName});
            console.log(`${firstName} said ${text}`)
        });


        socket.on("disconnect",()=>{

        });
    });
}

module.exports=initialiseSocket;