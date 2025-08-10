const jwt = require('jsonwebtoken');
const User = require("../models/user.js");
const { SECRET_KEY } = require('../config/constants.js');

module.exports = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }

        // Verify the token
        const decodedObj = jwt.verify(token, SECRET_KEY); // Verify the token using the secret key
        const _id = decodedObj._id; // Extract _id from the token payload

        if (!_id) {
            return res.status(401).send("Invalid Token: _id is missing");
        }

        // Find the user by _id
        const user = await User.findById(_id);
        if (!user) {
          return res.status(401).send("User not Found");
        }

        // Attach the user to req.user
        req.user = user;
        next();
    } catch (err) {
        console.log("Error in userAuth.js");
        console.log(err.message);
        return res.status(400).send(err.message);
    }
};