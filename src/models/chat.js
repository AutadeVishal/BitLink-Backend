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

const readReceiptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastReadAt: {
        type: Date,
        default: () => new Date(0)
    }
}, {
    _id: false
});


const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
        }
    ],
    messages: [messageSchema],
    readReceipts: [readReceiptSchema]
}, {
    timestamps: true
});

chatSchema.methods.ensureReadReceipts = function () {
    if (!Array.isArray(this.readReceipts)) {
        this.readReceipts = [];
    }

    this.participants.forEach((participantId) => {
        const exists = this.readReceipts.some((receipt) => String(receipt.userId) === String(participantId));
        if (!exists) {
            this.readReceipts.push({
                userId: participantId,
                lastReadAt: new Date(0)
            });
        }
    });
};

chatSchema.methods.getUserLastReadAt = function (userId) {
    const receipt = (this.readReceipts || []).find((row) => String(row.userId) === String(userId));
    if (!receipt || !receipt.lastReadAt) {
        return new Date(0);
    }
    return new Date(receipt.lastReadAt);
};

chatSchema.methods.markUserAsRead = function (userId, readAt = new Date()) {
    this.ensureReadReceipts();

    const receipt = this.readReceipts.find((row) => String(row.userId) === String(userId));
    if (!receipt) {
        this.readReceipts.push({
            userId,
            lastReadAt: readAt
        });
        return;
    }

    if (!receipt.lastReadAt || new Date(receipt.lastReadAt) < readAt) {
        receipt.lastReadAt = readAt;
    }
};


chatSchema.pre('save', function (next) {
    if (this.participants.length > 2) {
        return next(new Error("Chat cannot have more than 2 participants"));
    }

    this.ensureReadReceipts();

    next();
});


const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };