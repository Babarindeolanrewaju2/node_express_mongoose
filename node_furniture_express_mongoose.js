const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const furnitureSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    description: {
        type: String
    },
    specification: {
        type: String
    },
    size: {
        type: String
    },
    reviews: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        }
    }],
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Furniture'
    }]
});

module.exports = mongoose.model('Furniture', furnitureSchema);

const express = require('express');
const router = express.Router();
const Furniture = require('../models/furniture');

// Create furniture
router.post('/', async (req, res) => {
    try {
        const furniture = new Furniture(req.body);
        await furniture.save();
        res.send(furniture);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read all furniture
router.get('/', async (req, res) => {
    try {
        const furniture = await Furniture.find().populate('relatedProducts');
        res.send(furniture);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read furniture by ID
router.get('/:id', async (req, res) => {
    try {
        const furniture = await Furniture.findById(req.params.id).populate('relatedProducts');
        if (!furniture) {
            res.status(404).send('Furniture not found');
        } else {
            res.send(furniture);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update furniture
router.put('/:id', async (req, res) => {
    try {
        const furniture = await Furniture.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!furniture) {
            res.status(404).send('Furniture not found');
        } else {
            res.send(furniture);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete furniture
router.delete('/:id', async (req, res) => {
    try {
        const furniture = await Furniture.findByIdAndDelete(req.params.id);
        if (!furniture) {
            res.status(404).send('Furniture not found');
        } else {
            res.send(furniture);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

// Register user
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.send(user);
    } catch (error) {
        res.status
        // 500 Internal Server Error
        res.status(500).send(error);
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(401).send('Authentication failed');
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Authentication failed');
        }
        const token = jwt.sign({
            userId: user._id
        }, 'secretKey');
        res.send({
            token
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

module.exports = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send('Authentication failed');
    }
    try {
        const decodedToken = jwt.verify(token, 'secretKey');
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        res.status(401).send('Authentication failed');
    }
};

// Read all furniture with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default page 1 if not specified
        const limit = parseInt(req.query.limit) || 10; // default limit 10 if not specified
        const skip = (page - 1) * limit;

        const furniture = await Furniture.find().populate('relatedProducts')
            .skip(skip)
            .limit(limit);
        const count = await Furniture.countDocuments();

        const totalPages = Math.ceil(count / limit);

        res.send({
            data: furniture,
            page,
            totalPages,
            totalItems: count
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


//GET /furniture?page=2&limit=20