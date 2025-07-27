const jwt = require('jsonwebtoken');
const User = require("../models/User.js");

module.exports = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("Token is Not Valid");
        }

        // Verify the token
        const decodedObj =await  jwt.verify(token, "1234"); // Verify the token using the secret key
        const _id = decodedObj._id; // Extract _id from the token payload

        if (!_id) {
            throw new Error("Invalid Token: _id is missing");
        }

        // Find the user by _id
        const user = await User.findById({_id}); // Pass the _id directly
        if (!user) {
            throw new Error("User not Found");
        }

        // Attach the user to req.user
        req.user = user;
       next(); 
       //async don't have compulsion of next()
    } catch (err) {
        console.log(err.message);
        res.status(401).send(err.message);
    }
};