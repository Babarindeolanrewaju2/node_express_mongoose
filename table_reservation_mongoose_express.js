const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
});

const Table = mongoose.model('Table', tableSchema);

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    start_time: {
        type: String,
        required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    partySize: {
        type: Number,
        required: true,
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
    },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = {
    Table,
    Reservation
};

const express = require('express');
const router = express.Router();
const {
    Table,
    Reservation
} = require('path/to/models');

// Create a new table
router.post('/tables', async (req, res) => {
    const {
        tableNumber,
        capacity
    } = req.body;
    const table = new Table({
        tableNumber,
        capacity
    });

    try {
        await table.save();
        res.status(201).json(table);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Get all tables
router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get one table
router.get('/tables/:id', async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (table) {
            res.json(table);
        } else {
            res.status(404).json({
                message: 'Table not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Update a table
router.patch('/tables/:id', async (req, res) => {
    try {
        const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (table) {
            res.json(table);
        } else {
            res.status(404).json({
                message: 'Table not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete a table
router.delete('/tables/:id', async (req, res) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if (table) {
            res.json(table);
        } else {
            res.status(404).json({
                message: 'Table not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

const express = require('express');
const router = express.Router();
const Reservation = require('path/to/models/reservation');

// Create a new reservation
router.post('/reservations', async (req, res) => {
    const {
        date,
        start_time,
        end_time,
        partySize,
        table
    } = req.body;
    const existingReservation = await Reservation.find({
        table,
        date,
        time: {
            $gte: start_time,
            $lte: end_time
        }
    });
    if (existingReservation.length > 0) {
        res.status(400).json({
            message: 'Table is not available at this time'
        });
    } else {
        const reservation = new Reservation({
            date,
            start_time,
            end_time,
            partySize,
            table
        });
        try {
            await reservation.save();
            res.status(201).json(reservation);
        } catch (err) {
            res.status(400).json({
                message: err.message
            });
        }
    }
});


// Get all reservations
router.get('/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get one reservation
router.get('/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            res.json(reservation);
        } else {
            res.status(404).json({
                message: 'Reservation not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Update a reservation
router.patch('/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (reservation) {
            res.json(reservation);
        } else {
            res.status(404).json({
                message: 'Reservation not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete a reservation
router.delete('/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (reservation) {
            res.json(reservation);
        } else {
            res.status(404).json({
                message: 'Reservation not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('path/to/server');
const Reservation = require('path/to/models/reservation');

chai.should();
chai.use(chaiHttp);

describe('Reservations', () => {
            beforeEach(async () => {
                // Clear the database before each test
                await Reservation.deleteMany({});
            });

            describe('POST /reservations', () => {
                it('should create a new reservation', async () => {
                    const res = await chai
                        .request(server)
                        .post('/reservations')
                        .send({
                            date: '2022-01-15',
                            start_time: '19:00',
                            end_time: '22:00',
                            partySize: 4,
                            table: '5f9a8c7e7d2dbefab7e7f8c8'
                        });
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('date').eql('2022-01-15');
                    res.body.should.have.property('start_time').eql('19:00');
                    res.body.should.have.property('end_time').eql('22:00');
                    res.body.should.have.property('partySize').eql(4);
                    res.body.should.have.property('table').eql('5f9a8c7e7d2dbefab7e7f8c8');
                });
            });

            describe('GET /reservations', () => {
                it('should get all reservations', async () => {
                    await new Reservation({
                        date: '2022-01-15',
                        start_time: '19:00',
                        end_time: '22:00',
                        partySize: 4,
                        table: '5f9a8c7e7d2dbefab7e7f8c8'
                    }).save();
                    const res = await chai.request(server).get('/reservations');
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                });
            });

            describe('GET /reservations/:id', describe('GET /reservations/:id', () => {
                    it('should get a reservation by id', async () => {
                        const reservation = await new Reservation({
                            date: '2022-01-15',
                            start_time: '19:00',
                            end_time: '22:00',
                            partySize: 4,
                            table: '5f9a8c7e7d2dbefab7e7f8c8'
                        }).save();
                        const res = await chai.request(server).get(`/reservations/${reservation._id}`);
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('date').eql('2022-01-15');
                        res.body.should.have.property('start_time').eql('19:00');
                        res.body.should.have.property('end_time').eql('22:00');
                        res.body.should.have.property('partySize').eql(4);
                        res.body.should.have.property('table').eql('5f9a8c7e7d2dbefab7e7f8c8');
                    });

                    it('should return 404 if id is invalid', async () => {
                        const res = await chai.request(server).get('/reservations/invalid_id');
                        res.should.have.status(404);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Reservation not found');
                    });
                });

                describe('PATCH /reservations/:id', () => {
                    it('should update a reservation by id', async () => {
                        const reservation = await new Reservation({
                            date: '2022-01-15',
                            start_time: '19:00',
                            end_time: '22:00',
                            partySize: 4,
                            table: '5f9a8c7e7d2dbefab7e7f8c8'
                        }).save();
                        const res = await chai
                            .request(server)
                            .patch(`/reservations/${reservation._id}`)
                            .send({
                                partySize: 6
                            });
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('partySize').eql(6);
                    });

                    it('should return 404 if id is invalid', async () => {
                        const res = await chai.request(server).patch('/reservations/invalid_id').send({
                            partySize: 6
                        });
                        res.should.have.status(404);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Reservation not found');
                    });
                });

                describe('DELETE /reservations/:id', () => {
                    it('should delete a reservation by id', async () => {
                        const reservation = await new Reservation({
                            date: '2022-01-15',
                            start_time: '19:00',
                            end_time: '22:00',
                            partySize: 4,
                            table: '5f9a8c7e7d2dbefab7e7f8c8'
                        }).save();
                        const res = await chai.request(server).delete(`/reservations/${reservation._id}`);
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('date').eql('2022-01-15');
                        res.body.should.have.property('start_time').eql('19:00');
                        res.body.should.have.property('end_time').eql('22:00');
                        res.body.should.have.property('partySize').eql(4);
                        res.body.should.have.property('table').eql('5f9a8c7e7d2dbefab7e7f8c8');
                    });

                    it('should return 404 if id is invalid', async () => {
                        const res = await chai.request(server).delete('/reservations/invalid_id');
                        res.should.have.status(404);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Reservation not found');
                    });
                });
            });