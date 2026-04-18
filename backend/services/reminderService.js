const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Job = require('../models/Job');

let reminderTask;

const canSendEmail = () =>
    Boolean(
        process.env.SMTP_HOST
        && process.env.SMTP_PORT
        && process.env.SMTP_USER
        && process.env.SMTP_PASS,
    );

const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendReminderEmail = async ({ job }) => {
    if (!canSendEmail() || !job.reminder?.emailNotifications || !job.user?.email) {
        return false;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: job.user.email,
        subject: `Follow up with ${job.company} for ${job.role}`,
        text: [
            `Hi ${job.user.name || 'there'},`,
            '',
            `This is your reminder to follow up on your ${job.role} application at ${job.company}.`,
            `Current status: ${job.status}`,
            job.jobUrl ? `Job link: ${job.jobUrl}` : '',
            '',
            'Sent by Job Tracker Copilot',
        ].filter(Boolean).join('\n'),
    });

    return true;
};

const processDueReminders = async () => {
    const now = new Date();
    const resendThreshold = new Date(now.getTime() - (18 * 60 * 60 * 1000));
    const jobs = await Job.find({
        status: { $nin: ['Offer', 'Rejected'] },
        'reminder.enabled': true,
        'reminder.followUpDate': { $lte: now },
        $or: [
            { 'reminder.lastReminderSent': null },
            { 'reminder.lastReminderSent': { $exists: false } },
            { 'reminder.lastReminderSent': { $lte: resendThreshold } },
        ],
    }).populate('user', 'name email');

    for (const job of jobs) {
        try {
            const emailSent = await sendReminderEmail({ job });

            if (emailSent) {
                job.reminder.lastReminderSent = now;
                await job.save();
            } else {
                console.log(`Reminder due for ${job.company} - ${job.role}`);
            }
        } catch (error) {
            console.error(`Reminder processing failed for job ${job._id}:`, error.message);
        }
    }
};

const startReminderCron = () => {
    if (reminderTask) {
        return reminderTask;
    }

    reminderTask = cron.schedule('0 * * * *', () => {
        processDueReminders().catch((error) => {
            console.error('Reminder cron failed:', error.message);
        });
    }, {
        timezone: process.env.REMINDER_TIMEZONE || 'UTC',
    });

    return reminderTask;
};

module.exports = {
    startReminderCron,
    processDueReminders,
};
