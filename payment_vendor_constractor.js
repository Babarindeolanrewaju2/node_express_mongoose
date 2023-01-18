const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentRequestSchema = new Schema({
    vendor: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    staff: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
});

const contractorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
});

const paymentSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    contractor: {
        type: Schema.Types.ObjectId,
        ref: 'Contractor'
    },
});

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);
const Contractor = mongoose.model('Contractor', contractorSchema);
const Payment = mongoose.model('Payment', paymentSchema);

const express = require('express');
const router = express.Router();

router.get('/submit', (req, res) => {
    res.json({
        message: "submit route reached"
    });
});

router.post('/submit', async (req, res) => {
    try {
        const paymentRequest = new PaymentRequest(req.body);
        await paymentRequest.save();
        res.json({
            message: "Payment request submitted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
});

router.get('/review', async (req, res) => {
    try {
        const paymentRequests = await PaymentRequest.find({
            status: 'pending'
        });
        res.json({
            paymentRequests
        });
    } catch (err) {
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
});

router.post('/approve/:id', async (req, res) => {
    try {
        const paymentRequest = await PaymentRequest.findById(req.params.id);
        paymentRequest.status = 'approved';
        await paymentRequest.save();
        const contractor = await Contractor.findOne({
            name: paymentRequest.vendor
        });
        if (!contractor) {
            //create new contractor
            const newContractor = new Contractor({
                name: paymentRequest.vendor,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address
            });
            await newContractor.save();
            const payment = new Payment({
                amount: paymentRequest.amount,
                contractor: newContractor._id
            });
            await payment.save();
        } else {
            //add payment to existing contractor
            const payment = new Payment({
                amount: paymentRequest.amount,
                contractor: contractor._id
            });
            await payment.save();
        }
        res.json({
            message: "Payment request approved successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
});

router.post('/reject/:id', async (req, res) => {
    try {
        const paymentRequest = await PaymentRequest.findById(req.params.id);
        paymentRequest.status = 'rejected';
        await paymentRequest.save();
        res.json({
            message: "Payment request rejected successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
});

function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role === role) {
            next();
        } else {
            res.status(401).json({
                error: 'Unauthorized'
            });
        }
    }
}

function checkAmount(req, res, next) {
    const amount = req.body.amount;
    if (amount <= 1000 && req.user.role === 'manager') {
        next();
    } else if (amount > 1000 && amount <= 10000 && req.user.role === 'supervisor') {
        next();
    } else if (amount > 10000 && req.user.role === 'executive') {
        next();
    } else {
        res.status(401).json({
            error: 'Unauthorized'
        });
    }
}

router.use('/approve/:id', checkRole('manager'));
router.use('/approve/:id', checkAmount);