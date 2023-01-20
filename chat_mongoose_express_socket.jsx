const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chat', {
  useNewUrlParser: true,
});

// Define the chat message schema
const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Chat model
const Chat = mongoose.model('Chat', chatSchema);

// Listen for WebSocket connections
io.on('connection', (socket) => {
  // Send the previous messages to the client when they first connect
  Chat.find().then((messages) => socket.emit('previous messages', messages));

  // Save new messages to the database and emit them to all clients
  socket.on('new message', (data) => {
    const chat = new Chat({
      message: data.message,
      author: data.author,
    });
    chat
      .save()
      .then(() => io.emit('new message', chat))
      .catch((error) => console.error(error));
  });
});

// Retrieve the previous messages
app.get('/messages', (req, res) => {
  Chat.find()
    .then((messages) => res.json(messages))
    .catch((error) => console.error(error));
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Connect to the WebSocket server and listen for incoming messages
  useEffect(() => {
    const socket = io('http://localhost:3000');
    setSocket(socket);
    socket.on('previous messages', (messages) => {
      setMessages(messages);
    });
    socket.on('new message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to handle sending a new message
  const sendMessage = (message) => {
    socket.emit('new message', message);
  };

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.author}: {message.message}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(e.target.message.value);
          e.target.reset();
        }}
      >
        <input
          name="message"
          type="text"
          placeholder="Type your message here"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
