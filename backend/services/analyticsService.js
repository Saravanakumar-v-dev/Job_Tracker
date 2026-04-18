const Job = require('../models/Job');
const { round } = require('../utils/text');

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const buildMonthlyActivity = (jobs = []) => {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const now = new Date();
    const buckets = [];

    for (let index = 5; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        buckets.push({
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: formatter.format(date),
            applications: 0,
            interviews: 0,
            offers: 0,
        });
    }

    for (const job of jobs) {
        const appliedDate = new Date(job.dateApplied || job.createdAt || Date.now());
        const bucketKey = `${appliedDate.getFullYear()}-${appliedDate.getMonth()}`;
        const bucket = buckets.find((entry) => entry.key === bucketKey);

        if (!bucket) {
            continue;
        }

        bucket.applications += 1;
        if (job.status === 'Interview') bucket.interviews += 1;
        if (job.status === 'Offer') bucket.offers += 1;
    }

    return buckets.map(({ key, ...bucket }) => bucket);
};

const getJobAnalytics = async (userId) => {
    const jobs = await Job.find({ user: userId }).sort({ dateApplied: -1 }).lean();
    const statusBreakdown = STATUSES.reduce((accumulator, status) => {
        accumulator[status] = 0;
        return accumulator;
    }, {});

    let atsTotal = 0;
    let atsCount = 0;
    let interviewProbabilityTotal = 0;
    let interviewProbabilityCount = 0;
    const skillGapCounts = {};

    for (const job of jobs) {
        statusBreakdown[job.status] = (statusBreakdown[job.status] || 0) + 1;

        if (typeof job.analysis?.atsScore === 'number') {
            atsTotal += job.analysis.atsScore;
            atsCount += 1;
        }

        if (typeof job.analysis?.interviewProbability === 'number') {
            interviewProbabilityTotal += job.analysis.interviewProbability;
            interviewProbabilityCount += 1;
        }

        for (const skill of job.analysis?.missingSkills || []) {
            skillGapCounts[skill] = (skillGapCounts[skill] || 0) + 1;
        }
    }

    const totalApplications = jobs.length;
    const interviewed = statusBreakdown.Interview || 0;
    const offered = statusBreakdown.Offer || 0;
    const rejected = statusBreakdown.Rejected || 0;
    const analyzedApplications = jobs.filter((job) => typeof job.analysis?.atsScore === 'number').length;
    const withResumeCount = jobs.filter((job) => job.resume?.fileName).length;
    const upcomingReminders = jobs
        .filter((job) => job.reminder?.enabled && job.reminder?.followUpDate && !['Offer', 'Rejected'].includes(job.status))
        .sort((left, right) => new Date(left.reminder.followUpDate) - new Date(right.reminder.followUpDate))
        .slice(0, 5)
        .map((job) => ({
            id: job._id,
            company: job.company,
            role: job.role,
            status: job.status,
            followUpDate: job.reminder.followUpDate,
        }));

    const topSkillGaps = Object.entries(skillGapCounts)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([skill, count]) => ({ skill, count }));

    return {
        totalApplications,
        statusBreakdown,
        interviewRate: totalApplications ? round((interviewed / totalApplications) * 100, 1) : 0,
        offerRate: totalApplications ? round((offered / totalApplications) * 100, 1) : 0,
        rejectionRate: totalApplications ? round((rejected / totalApplications) * 100, 1) : 0,
        successRatio: totalApplications ? round((offered / totalApplications) * 100, 1) : 0,
        avgAtsScore: atsCount ? round(atsTotal / atsCount, 1) : 0,
        avgInterviewProbability: interviewProbabilityCount ? round(interviewProbabilityTotal / interviewProbabilityCount, 1) : 0,
        analyzedApplications,
        withResumeCount,
        topSkillGaps,
        upcomingReminders,
        monthlyActivity: buildMonthlyActivity(jobs),
    };
};

module.exports = {
    getJobAnalytics,
};
