const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    availableLeaveDays: {
        type: Number,
        default: 20,
    },
});

const leaveSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
});

const Employee = mongoose.model('Employee', employeeSchema);
const Leave = mongoose.model('Leave', leaveSchema);

const express = require('express');
const router = express.Router();

router.post('/leave', async (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const employeeId = req.user._id;

    //Checking the available leave days of the employee
    const employee = await Employee.findById(employeeId);
    const noOfLeaveDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    if (employee.availableLeaveDays < noOfLeaveDays) {
        return res.status(400).send({
            error: `You have ${employee.availableLeaveDays} days of leave available`,
        });
    }

    //if the employee have enough leave days
    const leave = new Leave({
        employee: employeeId,
        startDate,
        endDate,
    });
    await leave.save();

    //update the available leave days of the employee
    employee.availableLeaveDays -= noOfLeaveDays;
    await employee.save();

    res.send(leave);
});

router.patch('/leave/:id/approve', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).send({
                error: 'Leave not found'
            });
        }
        leave.status = 'approved';
        await leave.save();
        res.send(leave);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/leave/:id/reject', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).send({
                error: 'Leave not found'
            });
        }
        leave.status = 'rejected';
        await leave.save();
        res.send(leave);
    } catch (error) {
        res.status(500).send(error);
    }
});


router.patch('/leave/:id/approve', checkUserRole(['manager', 'hr']), async (req, res) => {
    try {
        //logic to approve leave
    }
});

router.patch('/leave/:id/reject', checkUserRole(['manager', 'hr']), async (req, res) => {
    try {
        //logic to reject leave
    }
});


function checkUserRole(roles) {
    return (req, res, next) => {
        //Check if the user is authenticated
        if (!req.user) {
            return res.status(401).send({
                error: 'Unauthorized'
            });
        }
        //check if user has the required role
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({
                error: 'Forbidden'
            });
        }
        next();
    };
}

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['manager', 'hr'],
        default: 'manager'
    }
});

const User = mongoose.model('User', userSchema);