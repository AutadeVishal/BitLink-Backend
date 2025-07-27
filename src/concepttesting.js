const mongoose = require('mongoose');

// Generate a new ObjectId
const newId = new mongoose.Types.ObjectId();
console.log(newId); // Example: 643f1f77bcf86cd799439011

// Convert a string to an ObjectId
const idFromString = new mongoose.Types.ObjectId('643f1f77bcf86cd799439011');
console.log(idFromString);
console.log(mongoose.Types.ObjectId.isValid(idFromString)); // true