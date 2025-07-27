const express = require('express');
const requestRouter = express.Router();
const User = require('../models/User.js')
const  ConnectionRequestModel  = require('../models/connectionRequest')
const userAuth = require('../middlewares/userAuth.js')
requestRouter.post('/request/send/:status/:toUserEmail', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUser = await User.findOne({ email: req.params.toUserEmail });
        if (!toUser) {
            throw new Error("User not Found");
        }
        const toUserId = toUser._id;
        const allowedStatus = ["ignored", "interested"];
        const status = req.params.status;
        if (!allowedStatus.includes(status)) {
            throw new Error("Unidentified Status")
        }

        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
                //this is same as above commented 
                //here it check from the array of condition whether anyone of them is true 
                //if true then return the document
                //it is used to check mutiple conditions at a one like here from user and 
                // to user can be checked interchangibly becouse direction doesn't matter
            ]
        });

        if (existingConnectionRequest) {
            if (existingConnectionRequest.status === status) {
                return res.json({
                    message: `Connection request already exists with status "${status}" between ${req.user.firstName} and ${toUser.firstName}`,
                    data: existingConnectionRequest
                })

            }
            else if (existingConnectionRequest.status == "accepted") {
                return res.json({
                    message: `${req.user.firstName} is already connected to ${toUser.firstName}`
                })
            }
            // Update the status of the existing connection request
            existingConnectionRequest.status = status;
            const info = await existingConnectionRequest.save();
            return res.json({
                message: `Status for ${req.user.firstName} updated as ${status} for User ${toUser.firstName}`,
                data: info
            });
        }

        const connectionrequest = new ConnectionRequestModel({
            fromUserId: fromUserId,
            toUserId: toUserId,
            status: status

        });

        //completely new one so add it in database
        const info = await connectionrequest.save();
        res.json({
            message: `${req.user.firstName} is Interested in ${toUser.firstName}`,
            data: {
                info
            }
        })
    } catch (err) {
        console.log("Error in Sending Connection Request:", err.message);
        res.status(400).send("Error Occured");
    }
});



requestRouter.post('/request/review/:status/:fromUserEmail', userAuth, async (req, res) => {
    try {
        /* Conditions:
        1. A->B is the request already in the database
        2. It should have status = "interested"
        3. Currently logged-in user should be B (obviously, the request was from A->B)
        4. fromUserEmail must exist
        */
        const toUser = req.user; // Currently logged-in user
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(req.params.status)) {
            throw new Error("Not Allowed Status");
        }

        const fromUser = await User.findOne({ email: req.params.fromUserEmail });
        if (!fromUser) {
            throw new Error("No Such fromUser Exists");
        }

        // Check if the users are already connected
        const existingConnection = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId: fromUser._id, toUserId: toUser._id, status: "accepted" },
                { fromUserId: toUser._id, toUserId: fromUser._id, status: "accepted" }
            ]
        });

        if (existingConnection) {
            return res.json({
                message: `${fromUser.email} is already connected to ${toUser.email}`,
                connection: existingConnection
            });
        }

        // Check if there is an existing connection request
        const connectionObject = await ConnectionRequestModel.findOne({
            fromUserId: fromUser._id,
            toUserId: toUser._id,
            status: "interested"
        });

        if (!connectionObject) {
            throw new Error(`No Connection Request from ${fromUser.email} to ${toUser.email}`);
        }

        // Update the status of the connection request
        connectionObject.status = req.params.status;
        const updatedConnection = await connectionObject.save();

        res.json({
            message: `${toUser.email} ${req.params.status} the request from ${fromUser.email}`,
            updatedConnection: updatedConnection
        });
    } catch (err) {
        console.log(`Error in /request/review/${req.params.status}/${req.params.fromUserEmail}:`, err.message);
        res.status(404).send("Error Occurred in Our Beautiful Website");
    }
});
module.exports = requestRouter;