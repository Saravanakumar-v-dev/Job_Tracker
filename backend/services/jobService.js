const { createHttpError } = require('../utils/httpError');
const { clampNumber, uniqueValues } = require('../utils/text');

const normalizeString = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
};

const normalizeNumber = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date, numberOfDays) => {
    const output = new Date(date);
    output.setDate(output.getDate() + numberOfDays);
    return output;
};

const buildReminderPayload = ({ payload, dateApplied, existingReminder = {} }) => {
    const reminderInput = payload.reminder || {};
    const enabled = Boolean(
        reminderInput.enabled
        ?? payload.reminderEnabled
        ?? existingReminder.enabled
        ?? false
    );
    const followUpDays = Math.max(
        1,
        Math.min(
            normalizeNumber(reminderInput.followUpDays ?? payload.followUpDays ?? existingReminder.followUpDays ?? 7) || 7,
            90,
        ),
    );
    const explicitFollowUpDate = normalizeDate(reminderInput.followUpDate ?? payload.followUpDate);
    const followUpDate = enabled
        ? (explicitFollowUpDate || addDays(dateApplied, followUpDays))
        : null;

    return {
        enabled,
        followUpDays,
        followUpDate,
        emailNotifications: Boolean(
            reminderInput.emailNotifications
            ?? payload.emailNotifications
            ?? existingReminder.emailNotifications
            ?? false
        ),
        lastReminderSent: existingReminder.lastReminderSent || null,
    };
};

const buildJobPayload = ({ payload = {}, existingJob } = {}) => {
    const company = normalizeString(payload.company || existingJob?.company);
    const role = normalizeString(payload.role || existingJob?.role);

    if (!company || !role) {
        throw createHttpError(400, 'Please provide both company and role.');
    }

    const status = normalizeString(payload.status || existingJob?.status || 'Applied');
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
        throw createHttpError(400, 'Status must be Applied, Interview, Offer, or Rejected.');
    }

    const dateApplied = normalizeDate(payload.dateApplied) || existingJob?.dateApplied || new Date();
    const resume = payload.resume || {};
    const analysis = payload.analysis || {};
    const normalizedPayload = {
        company,
        role,
        status,
        dateApplied,
        notes: normalizeString(payload.notes ?? existingJob?.notes),
        jobUrl: normalizeString(payload.jobUrl ?? existingJob?.jobUrl),
        jobDescription: normalizeString(payload.jobDescription ?? existingJob?.jobDescription),
        location: normalizeString(payload.location ?? existingJob?.location),
        resume: {
            fileName: normalizeString(resume.fileName ?? payload.resumeName ?? existingJob?.resume?.fileName),
            extractedText: normalizeString(resume.extractedText ?? payload.resumeText ?? existingJob?.resume?.extractedText),
            uploadedAt: normalizeDate(resume.uploadedAt ?? payload.resumeUploadedAt) || existingJob?.resume?.uploadedAt || null,
        },
        analysis: {
            atsScore: normalizeNumber(analysis.atsScore ?? payload.atsScore ?? existingJob?.analysis?.atsScore),
            keywordMatchPercentage: normalizeNumber(analysis.keywordMatchPercentage ?? payload.keywordMatchPercentage ?? existingJob?.analysis?.keywordMatchPercentage),
            skillMatchPercentage: normalizeNumber(analysis.skillMatchPercentage ?? payload.skillMatchPercentage ?? existingJob?.analysis?.skillMatchPercentage),
            resumeQualityScore: normalizeNumber(analysis.resumeQualityScore ?? payload.resumeQualityScore ?? existingJob?.analysis?.resumeQualityScore),
            interviewProbability: normalizeNumber(analysis.interviewProbability ?? payload.interviewProbability ?? existingJob?.analysis?.interviewProbability),
            matchedKeywords: uniqueValues(analysis.matchedKeywords ?? existingJob?.analysis?.matchedKeywords ?? []).slice(0, 20),
            missingKeywords: uniqueValues(analysis.missingKeywords ?? existingJob?.analysis?.missingKeywords ?? []).slice(0, 20),
            matchedSkills: uniqueValues(analysis.matchedSkills ?? existingJob?.analysis?.matchedSkills ?? []).slice(0, 20),
            missingSkills: uniqueValues(analysis.missingSkills ?? existingJob?.analysis?.missingSkills ?? []).slice(0, 20),
            suggestions: uniqueValues(analysis.suggestions ?? existingJob?.analysis?.suggestions ?? []).slice(0, 8),
            rewrittenBulletPoints: uniqueValues(analysis.rewrittenBulletPoints ?? existingJob?.analysis?.rewrittenBulletPoints ?? []).slice(0, 4),
            lastAnalyzedAt: normalizeDate(analysis.lastAnalyzedAt ?? payload.lastAnalyzedAt) || existingJob?.analysis?.lastAnalyzedAt || null,
        },
    };

    for (const metricField of ['atsScore', 'keywordMatchPercentage', 'skillMatchPercentage', 'resumeQualityScore', 'interviewProbability']) {
        if (typeof normalizedPayload.analysis[metricField] === 'number') {
            normalizedPayload.analysis[metricField] = clampNumber(normalizedPayload.analysis[metricField]);
        }
    }

    normalizedPayload.reminder = buildReminderPayload({
        payload,
        dateApplied,
        existingReminder: existingJob?.reminder,
    });

    if (['Offer', 'Rejected'].includes(status)) {
        normalizedPayload.reminder.enabled = false;
    }

    if (normalizedPayload.resume.fileName && !normalizedPayload.resume.uploadedAt) {
        normalizedPayload.resume.uploadedAt = new Date();
    }

    return normalizedPayload;
};

module.exports = {
    buildJobPayload,
};
