const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobboard', {
    useNewUrlParser: true
});

// Define job board's data model
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    description: String,
    salary: Number,
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }]
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resume: String,
    cover_letter: String
});
const Application = mongoose.model('Application', applicationSchema);

// Create express app
const app = express();

// Define routes
app.get('/jobs', (req, res) => {
    Job.find({}, (err, jobs) => {
        if (err) return res.status(500).json({
            message: err
        });
        res.json({
            jobs
        });
    });
});

app.post('/jobs', (req, res) => {
    Job.create(req.body, (err, job) => {
        if (err) return res.status(500).json({
            message: err
        });
        res.json({
            message: 'Job created successfully',
            job
        });
    });
});

app.post('/jobs/:id/apply', (req, res) => {
    Job.findById(req.params.id, (err, job) => {
        if (err) return res.status(500).json({
            message: err
        });
        Application.create({
            job: job._id,
            applicant: req.body.applicant,
            resume: req.body.resume,
            cover_letter: req.body.cover_letter
        }, (err, application) => {
            if (err) return res.status(500).json({
                message: err
            });
            job.applications.push(application._id);
            job.save((err) => {
                if (err) return res.status(500).json({
                    message: err
                });
                res.json({
                    message: 'Application submitted successfully',
                    application
                });
            });
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});