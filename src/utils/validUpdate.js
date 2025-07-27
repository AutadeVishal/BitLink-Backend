const validator = require("validator");
const User = require("../models/user");
module.exports = (data) => {
    const allowedUpdates = ["firstName", "lastName", "age", "password", "skills"];
    const isUpdateAllowed = Object.keys(data).every(k => allowedUpdates.includes(k));
    if (!isUpdateAllowed) {
        throw new Error("Update Not Allowed");
    }
    if (data?.skills?.length > 3) {
        throw new Error("Skills should be less than 10");
    }
    if (data?.password) {

        if (!validator.isStrongPassword(data?.password)) {
            throw new Error("Password is not strong enough");
        }
    }
    else {
        throw new Error("Password must be at least 8 characters long");
    }
}
