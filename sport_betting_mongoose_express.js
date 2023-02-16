const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

module.exports = mongoose.model('Sport', sportSchema);

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    odds: [{
        type: {
            type: String,
            enum: ['1', 'X', '2'],
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model('Event', eventSchema);

const express = require('express');
const router = express.Router();
const Sport = require('../models/sport');

// Create new sport
router.post('/', async (req, res) => {
    try {
        const sport = new Sport({
            name: req.body.name,
            description: req.body.description
        });
        await sport.save();
        res.send(sport);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read all sports
router.get('/', async (req, res) => {
    try {
        const sports = await Sport.find().populate('events');
        res.send(sports);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read single sport
router.get('/:id', async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.id).populate('events');
        if (!sport) {
            return res.status(404).send('Sport not found');
        }
        res.send(sport);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update sport
router.patch('/:id', async (req, res) => {
    try {
        const sport = await Sport.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description
        }, {
            new: true
        });
        if (!sport) {
            return res.status(404).send('Sport not found');
        }
        res.send(sport);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete sport
router.delete('/:id', async (req, res) => {
    try {
        const sport = await Sport.findByIdAndDelete(req.params.id);
        if (!sport) {
            return res.status(404).send('Sport not found');
        }
        res.send(sport);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// Create new event
router.post('/', async (req, res) => {
    try {
        const event = new Event({
            name: req.body.name,
            sport: req.body.sport,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            odds: req.body.odds
        });
        await event.save();
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('sport');
        res.send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('sport');
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update event
router.patch('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            sport: req.body.sport,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            odds: req.body.odds
        }, {
            new: true
        });
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const sportsRouter = require('./routes/sports');
const eventsRouter = require('./routes/events');

const app = express();

mongoose.connect('mongodb://localhost/sportsbetting', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to database');
}).catch(error => {
    console.log(error);
});

app.use(express.json());

app.use('/sports', sportsRouter);
app.use('/events', eventsRouter);

app.listen(3000, () => {
    console.log('Server started');
});