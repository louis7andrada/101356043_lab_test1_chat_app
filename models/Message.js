// Message.js

const mongoose = require('mongoose');

// Define the schema for a message
const messageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true,
        unique: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create a model for the message schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
