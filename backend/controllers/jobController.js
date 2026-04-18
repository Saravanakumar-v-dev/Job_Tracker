const Job = require('../models/Job');
const { createHttpError } = require('../utils/httpError');
const { buildJobPayload } = require('../services/jobService');
const { getJobAnalytics } = require('../services/analyticsService');

const ensureOwnership = (job, userId) => {
    if (!job) {
        throw createHttpError(404, 'Job not found.');
    }

    if (job.user.toString() !== userId) {
        throw createHttpError(403, 'User not authorized for this job.');
    }
};

exports.getJobs = async (req, res) => {
    const filter = { user: req.user.id };

    if (req.query.status && req.query.status !== 'All') {
        filter.status = req.query.status;
    }

    if (req.query.search) {
        filter.$or = [
            { company: { $regex: req.query.search, $options: 'i' } },
            { role: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const jobs = await Job.find(filter).sort({ dateApplied: -1 });
    res.status(200).json(jobs);
};

exports.createJob = async (req, res) => {
    const payload = buildJobPayload({ payload: req.body });
    const job = await Job.create({
        ...payload,
        user: req.user.id,
    });

    res.status(201).json(job);
};

exports.updateJob = async (req, res) => {
    const job = await Job.findById(req.params.id);
    ensureOwnership(job, req.user.id);

    const payload = buildJobPayload({
        payload: req.body,
        existingJob: job.toObject(),
    });

    Object.assign(job, payload);
    await job.save();

    res.status(200).json(job);
};

exports.deleteJob = async (req, res) => {
    const job = await Job.findById(req.params.id);
    ensureOwnership(job, req.user.id);

    await job.deleteOne();
    res.status(200).json({ id: req.params.id });
};

exports.getJobStats = async (req, res) => {
    const analytics = await getJobAnalytics(req.user.id);
    res.status(200).json(analytics);
};
