// Import necessary modules
const express = require('express');
const redis = require('redis');
const mongoose = require('mongoose');

// Set up Redis client
const redisClient = redis.createClient();

// Set up Express app
const app = express();

// Set up MongoDB connection
mongoose.connect('mongodb://localhost/chat_app', {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Define chat message schema
const chatMessageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: Date
});

// Create chat message model
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Define API route for retrieving chat messages
app.get('/messages', (req, res) => {
    redisClient.get('chat_messages', (err, messages) => {
        if (messages) {
            return res.send(JSON.parse(messages));
        } else {
            ChatMessage.find({}, (err, messages) => {
                redisClient.setex('chat_messages', 3600, JSON.stringify(messages));
                return res.send(messages);
            });
        }
    });
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));
