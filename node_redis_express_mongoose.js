// Import necessary modules
const express = require('express');
const redis = require('redis');
const mongoose = require('mongoose');

// Set up Redis client
const redisClient = redis.createClient();

// Set up Express app
const app = express();
app.use(express.json());

// Set up MongoDB connection
mongoose.connect('mongodb://localhost/url_shortener', {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Define URL schema
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    createdAt: Date
});

// Create URL model
const Url = mongoose.model('Url', urlSchema);

// Define API route for shortening URLs
app.post('/shorten', async (req, res) => {
    const {
        originalUrl
    } = req.body;

    // Check if URL already exists in database
    let url = await Url.findOne({
        originalUrl
    });
    if (url) {
        return res.send(url);
    }

    // Generate short URL
    const shortUrl = Math.random().toString(36).substring(2, 8);

    // Add URL to database
    url = new Url({
        originalUrl,
        shortUrl,
        createdAt: new Date()
    });
    await url.save();

    // Add URL to Redis cache
    redisClient.setex(shortUrl, 3600, originalUrl);

    res.send(url);
});

// Define API route for retrieving original URLs
app.get('/:shortUrl', async (req, res) => {
    const {
        shortUrl
    } = req.params;

    // Check Redis cache first
    redisClient.get(shortUrl, async (err, originalUrl) => {
        if (originalUrl) {
            return res.redirect(originalUrl);
        }

        // If not found in Redis cache, check MongoDB
        const url = await Url.findOne({
            shortUrl
        });
        if (!url) {
            return res.status(404).send('URL not found');
        }

        // Add URL to Redis cache for faster lookup next time
        redisClient.setex(shortUrl, 3600, url.originalUrl);

        res.redirect(url.originalUrl);
    });
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));