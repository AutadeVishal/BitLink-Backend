const mongoose = require('mongoose')



const messageSchema = new mongoose.Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"
    },
    text:{
        type:String,
        required:true
    }
        

}, {
    timestamps: true
});


const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
        }
    ],
    messages: [messageSchema],
});


chatSchema.pre('save', function (next) {
    if (this.participants.length > 2) {
        return next(new Error("Chat cannot have more than 2 participants"));
    }
    next();
});


const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };