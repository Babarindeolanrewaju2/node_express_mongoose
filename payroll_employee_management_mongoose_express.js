const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost/payrollDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    hire_date: {
        type: Date,
        default: Date.now
    }
});

const Employee = mongoose.model('employee', EmployeeSchema);

const AttendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    time_in: {
        type: Date,
        default: Date.now
    },
    time_out: {
        type: Date
    }
});

const LeaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
});
const Leave = mongoose.model('leave', LeaveSchema);

EmployeeSchema.virtual('leaves', {
    ref: 'leave',
    localField: '_id',
    foreignField: 'employee'
});


const PayslipSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true
    },
    pay_period: {
        type: String,
        required: true
    },
    gross_pay: {
        type: Number,
        required: true
    },
    deductions: [{
        type: String,
        required: true
    }],
    net_pay: {
        type: Number,
        required: true
    }
});

const Payslip = mongoose.model('payslip', PayslipSchema);

EmployeeSchema.virtual('payslips', {
    ref: 'payslip',
    localField: '_id',
    foreignField: 'employee'
});

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    team_members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    }]
});

const Project = mongoose.model('project', ProjectSchema);

EmployeeSchema.virtual('projects', {
    ref: 'project',
    localField: '_id',
    foreignField: 'team_members'
});

router.route('/').get((req, res) => {
        Employee.find((err, employee) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(employee);
            }
        });
    })
    .post((req, res) => {
        const newEmployee = new Employee(req.body);
        newEmployee.save()
            .then(employee => {
                res.status(200).json({
                    'employee': 'Employee added successfully'
                });
            })
            .catch(err => {
                res.status(400).send('Adding new employee failed');
            });
    });

router.route('/:id').get((req, res) => {
    Employee.findById(req.params.id, (err, employee) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.json(employee);
        }
    });
}).put((req, res) => {
    Employee.findById(req.params.id, (err, employee) => {
        if (!employee)
            res.status(404).send("Data is not found");
        else
            employee.name = req.body.name;
        employee.email = req.body.email;
        employee.phone = req.body.phone;
        employee.address = req.body.address;
        employee.save().then(employee => {
                res.json('Employee updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
}).delete((req, res) => {
    Employee.findByIdAndRemove({
        _id: req.params.id
    }, (err, employee) => {
        if (err) res.json(err);
        else res.json('Employee deleted successfully');
    });
});

router.route('/').get((req, res) => {
        Attendance.find((err, attendance) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(attendance);
            }
        });
    })
    .post((req, res) => {
        const newAttendance = new Attendance(req.body);
        newAttendance.save()
            .then(attendance => {
                res.status(200).json({
                    'attendance': 'Attendance added successfully'
                });
            })
            .catch(err => {
                res.status(400).send('Adding new attendance failed');
            });
    });

router.route('/:id').get((req, res) => {
        Attendance.findById(req.params.id, (err, attendance) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(attendance);
            }
        });
    })
    .put((req, res) => {
        Attendance.findById(req.params.id, (err, attendance) => {
            if (!attendance)
                res.status(404).send("Data is not found");
            else
                attendance.employee_id = req.body.employee_id;
            attendance.time_in = req.body.time_in;
            attendance.time_out = req.body.time_out;
            attendance.save().then(attendance => {
                    res.json('Attendance updated!');
                })
                .catch(err => {
                    res.status(400).send("Update not possible");
                });
        });
    })
    .delete((req, res) => {
        Attendance.findByIdAndRemove({
            _id: req.params.id
        }, (err, attendance) => {
            if (err) res.json(err);
            else res.json('Attendance deleted successfully');
        });
    });

app.get('/view-attendance', (req, res) => {
    const perPage = 10;
    const page = req.query.page || 1;

    Attendance.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec((err, attendance) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(attendance);
            }
        });
});

app.post('/calculate-payroll', (req, res) => {
    // Code to calculate payroll for a specific employee
    Employee.findById(req.body.employeeId, (err, employee) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // retrieve the employee's attendance records for the pay period
            Attendance.find({
                employee: employee._id,
                time_in: {
                    $gte: req.body.startDate
                },
                time_out: {
                    $lte: req.body.endDate
                }
            }, (err, attendance) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    // calculate gross pay, deductions, and net pay
                    let grossPay = 0;
                    let deductions = 0;
                    let netPay = 0;
                    // code to calculate gross pay, deductions, and net pay based on attendance records
                    // ...
                    const newPayslip = new Payslip({
                        employee: employee._id,
                        pay_period: req.body.payPeriod,
                        gross_pay: grossPay,
                        deductions: deductions,
                        net_pay: netPay
                    });
                    newPayslip.save((err) => {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            res.json({
                                'payslip': 'Payslip generated successfully'
                            });
                        }
                    });
                }
            });
        }
    });
});

// alternative

app.post('/clock-in', (req, res) => {
    const newAttendance = new Attendance({
        employee_id: req.body.employee_id,
        time_in: new Date()
    });
    newAttendance.save((err) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log('Employee clocked in successfully');
            res.send('Employee clocked in successfully');
        }
    });
});


app.post('/clock-out', (req, res) => {
    Attendance.findOneAndUpdate({
        employee_id: req.body.employee_id,
        date: req.body.date
    }, {
        time_out: new Date()
    }, (err) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log('Employee clocked out successfully');
            res.send('Employee clocked out successfully');
        }
    });
});


app.get('/generate-report/:employeeId', (req, res) => {
    // Code to generate attendance and payroll reports
    Employee.findById(req.params.employeeId, (err, employee) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            Attendance.find({
                employee: employee._id,
                time_in: {
                    $gte: req.query.startDate
                },
                time_out: {
                    $lte: req.query.endDate
                }
            }, (err, attendance) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    const report = {};
                    // code to generate attendance report based on attendance records
                    // ...
                    report.attendance = attendance;
                    Payslip.find({
                        employee: employee._id,
                        pay_period: req.query.payPeriod
                    }, (err, payslips) => {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            // code to generate payroll report based on payslip records
                            // ...
                            report.payslips = payslips;
                            res.json(report);
                        }
                    });
                }
            });
        }
    });
});

app.post('/generate-payslip/:employeeId', (req, res) => {
    // Code to generate payslip for a specific employee
    Employee.findById(req.params.employeeId, (err, employee) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // retrieve the employee's attendance records for the current week
            const startWeek = moment().startOf('week').format('YYYY-MM-DD');
            const endWeek = moment().endOf('week').format('YYYY-MM-DD');
            Attendance.find({
                employee: employee._id,
                time_in: {
                    $gte: startWeek
                },
                time_out: {
                    $lte: endWeek
                }
            }, (err, attendance) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    // calculate gross pay, deductions, and net pay
                    let grossPay = 0;
                    let deductions = 0;
                    let netPay = 0;
                    // code to calculate gross pay, deductions, and net pay based on attendance records
                    // ...
                    const currentWeek = moment().week();
                    const newPayslip = new Payslip({
                        employee: employee._id,
                        pay_period: `week ${currentWeek}`,
                        gross_pay: grossPay,
                        deductions: deductions,
                        net_pay: netPay
                    });
                    newPayslip.save((err) => {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            res.json({
                                'payslip': 'Payslip generated successfully'
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/generate-payslip/:employeeId', (req, res) => {
    // Code to generate payslip for a specific employee
    Employee.findById(req.params.employeeId, (err, employee) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // retrieve the employee's attendance records for the specified week
            const startWeek = moment().week(req.body.week).startOf('week').format('YYYY-MM-DD');
            const endWeek = moment().week(req.body.week).endOf('week').format('YYYY-MM-DD');
            Attendance.find({
                employee: employee._id,
                time_in: {
                    $gte: startWeek
                },
                time_out: {
                    $lte: endWeek
                }
            }, (err, attendance) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    // calculate gross pay, deductions, and net pay
                    let grossPay = 0;
                    let deductions = 0;
                    let netPay = 0;
                    // code to calculate gross pay, deductions, and net pay based on attendance records
                    // ...
                    const currentWeek = req.body.week;
                    const newPayslip = new Payslip({
                        employee: employee._id,
                        pay_period: `week ${currentWeek}`,
                        gross_pay: grossPay,
                        deductions: deductions,
                        net_pay: netPay
                    });
                    newPayslip.save((err) => {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            res.json({
                                'payslip': 'Payslip generated successfully'
                            });
                        }
                    });
                }
            });
        }
    });
});

const Project = require('./models/project');
const Employee = require('./models/employee');

app.post('/projects', (req, res) => {
    // Create a new project
    Employee.findById(req.body.employee, (err, employee) => {
        if (err) {
            console.log(err);
            res.status(404).json(err);
        } else {
            const newProject = new Project({
                name: req.body.name,
                description: req.body.description,
                employee: employee._id
            });
            newProject.save()
                .then(project => res.json(project))
                .catch(err => res.status(400).json(err));
        }
    });
});

app.get('/projects', (req, res) => {
    // Get all projects
    Project.find().populate('employee')
        .then(projects => res.json(projects))
        .catch(err => res.status(400).json(err));
});

app.get('/projects/:id', (req, res) => {
    // Get a specific project
    Project.findById(req.params.id).populate('employee')
        .then(project => res.json(project))
        .catch(err => res.status(404).json(err));
});

app.patch('/projects/:id', (req, res) => {
    // Update a specific project
    Employee.findById(req.body.employee, (
        err, employee) => {
        if (err) {
            console.log(err);
            res.status(404).json(err);
        } else {
            Project.findByIdAndUpdate(req.params.id, {
                    name: req.body.name,
                    description: req.body.description,
                    employee: employee._id
                }, {
                    new: true
                })
                .then(project => res.json(project))
                .catch(err => res.status(404).json(err));
        }
    });
});

app.delete('/projects/:id', (req, res) => {
    // Delete a specific project
    Project.findByIdAndDelete(req.params.id)
        .then(() => res.json({
            success: true
        }))
        .catch(err => res.status(404).json(err));
});