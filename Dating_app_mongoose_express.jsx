const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: Number,
  location: String,
  interests: [String],
  matches: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
});

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = {
  User,
  Message,
};

const express = require('express');
const router = express.Router();
const Message = require('../models/message');

router.get('/api/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  Message.find({
    $or: [
      {
        sender: user1,
        recipient: user2,
      },
      {
        sender: user2,
        recipient: user1,
      },
    ],
  })
    .sort({
      date: 1,
    })
    .then((messages) => {
      if (!messages) return res.status(404).send('No messages found.');
      res.status(200).send(messages);
    })
    .catch((err) => res.status(500).send(err));
});

router.post('/api/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const { message } = req.body;
  const newMessage = new Message({
    sender: user1,
    recipient: user2,
    message,
  });
  newMessage
    .save()
    .then((message) => {
      res.status(200).send({
        message: 'Message sent successfully',
      });
    })
    .catch((err) => res.status(500).send(err));
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/api/users/interests/:interest', (req, res) => {
  const { interest } = req.params;
  User.find({
    interests: {
      $in: [interest],
    },
  })
    .then((users) => {
      if (!users) return res.status(404).send('No users found.');
      res.status(200).send(users);
    })
    .catch((err) => res.status(500).send(err));
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

router.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });
  newUser
    .save()
    .then((user) => {
      const token = jwt.sign(
        {
          id: user._id,
        },
        config.secret,
        {
          expiresIn: 86400, // expires in 24 hours
        }
      );
      res.status(200).send({
        auth: true,
        token,
      });
    })
    .catch((err) => res.status(500).send(err));
});

router.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({
    email,
  })
    .then((user) => {
      if (!user) return res.status(404).send('User not found.');
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword)
        return res.status(401).send({
          auth: false,
          token: null,
        });
      const token = jwt.sign(
        {
          id: user._id,
        },
        config.secret,
        {
          expiresIn: 86400, // expires in 24 hours
        }
      );
      res.status(200).send({
        auth: true,
        token,
      });
    })
    .catch((err) => res.status(500).send(err));
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/api/match', (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token)
    return res.status(401).send({
      auth: false,
      message: 'No token provided.',
    });
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err)
      return res.status(500).send({
        auth: false,
        message: 'Failed to authenticate token.',
      });
    User.findById(decoded.id)
      .then((user) => {
        if (!user) return res.status(404).send('User not found.');
        // apply logic to match user to other users
        // e.g. find users with similar interests, in the same location, etc.
        const query = {
          $and: [
            {
              _id: {
                $ne: user._id,
              },
            },
            {
              location: user.location,
            },
            {
              interests: {
                $in: user.interests,
              },
            },
          ],
        };
        User.find(query)
          .then((matchedUsers) => {
            if (!matchedUsers) return res.status(404).send('No matches found.');
            // Add the matched users to the current user's match list
            user.matches.push(...matchedUsers);
            user
              .save()
              .then((updatedUser) => {
                res.status(200).send(updatedUser.matches);
              })
              .catch((err) => res.status(500).send(err));
          })
          .catch((err) => res.status(500).send(err));
      })
      .catch((err) => res.status(500).send(err));
  });
});

module.exports = router;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Get the current user's messages from the backend
    axios
      .get('/api/messages')
      .then((res) => setMessages(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Send the new message to the backend
    axios
      .post('/api/messages', {
        message: newMessage,
      })
      .then((res) => {
        setMessages([...messages, res.data]);
        setNewMessage('');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <h2> Messages </h2>{' '}
      {messages.map((message) => (
        <div key={message._id}>
          <p> From: {message.sender.name} </p>{' '}
          <p> To: {message.recipient.name} </p> <p> {message.message} </p>{' '}
          <p> Sent on: {message.date} </p>{' '}
        </div>
      ))}{' '}
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />{' '}
        <button type="submit"> Send </button>{' '}
      </form>{' '}
    </div>
  );
};

export default Messages;
