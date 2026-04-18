const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    fileName: {
        type: String,
        trim: true,
    },
    extractedText: {
        type: String,
    },
    uploadedAt: {
        type: Date,
    },
}, { _id: false });

const analysisSchema = new mongoose.Schema({
    atsScore: { type: Number, min: 0, max: 100 },
    keywordMatchPercentage: { type: Number, min: 0, max: 100 },
    skillMatchPercentage: { type: Number, min: 0, max: 100 },
    resumeQualityScore: { type: Number, min: 0, max: 100 },
    interviewProbability: { type: Number, min: 0, max: 100 },
    matchedKeywords: [{ type: String, trim: true }],
    missingKeywords: [{ type: String, trim: true }],
    matchedSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    suggestions: [{ type: String, trim: true }],
    rewrittenBulletPoints: [{ type: String, trim: true }],
    lastAnalyzedAt: { type: Date },
}, { _id: false });

const reminderSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false,
    },
    followUpDays: {
        type: Number,
        default: 7,
        min: 1,
        max: 90,
    },
    followUpDate: {
        type: Date,
    },
    emailNotifications: {
        type: Boolean,
        default: false,
    },
    lastReminderSent: {
        type: Date,
        default: null,
    },
}, { _id: false });

const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true,
    },
    role: {
        type: String,
        required: [true, 'Please provide a role/position title'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
        default: 'Applied',
    },
    dateApplied: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        default: '',
    },
    jobUrl: {
        type: String,
        trim: true,
        default: '',
    },
    jobDescription: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        trim: true,
        default: '',
    },
    resume: {
        type: resumeSchema,
        default: () => ({}),
    },
    analysis: {
        type: analysisSchema,
        default: () => ({}),
    },
    reminder: {
        type: reminderSchema,
        default: () => ({
            enabled: false,
            followUpDays: 7,
            followUpDate: null,
            emailNotifications: false,
            lastReminderSent: null,
        }),
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

JobSchema.index({ user: 1, status: 1, dateApplied: -1 });
JobSchema.index({ user: 1, 'reminder.followUpDate': 1 });

module.exports = mongoose.model('Job', JobSchema);
