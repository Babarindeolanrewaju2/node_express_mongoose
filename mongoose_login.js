const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

const app = express();

app.post('/register', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const user = new User({
        email,
        password: hashedPassword
    });

    // Save the user to the database
    await user.save();

    res.send('User registered successfully!');
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

const app = express();

app.post('/register', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // Create a new user 
    const user = new User({
        email,
        password
    });

    // Save the user to the database
    await user.save();

    res.send('User registered successfully!');
});