const Job = require('../models/Job');
const mongoose = require('mongoose');

// @desc    Get all jobs for logged in user
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.id }).sort({ dateApplied: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
    try {
        const { company, role, status, dateApplied, notes } = req.body;
        
        if (!company || !role) {
            return res.status(400).json({ message: 'Please provide company and role' });
        }

        const job = await Job.create({
            company,
            role,
            status,
            dateApplied: dateApplied ? new Date(dateApplied) : Date.now(),
            notes,
            user: req.user.id
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check for user ownership
        if (job.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check for user ownership
        if (job.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await job.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get job stats
// @route   GET /api/jobs/stats
// @access  Private
exports.getJobStats = async (req, res) => {
    try {
        const stats = await Job.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const formattedStats = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const defaultStats = {
            Total: 0,
            Applied: formattedStats.Applied || 0,
            Interview: formattedStats.Interview || 0,
            Offer: formattedStats.Offer || 0,
            Rejected: formattedStats.Rejected || 0,
        };

        defaultStats.Total = Object.values(defaultStats).reduce((a, b) => a + b, 0);

        res.status(200).json(defaultStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
