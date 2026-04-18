require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startReminderCron } = require('./services/reminderService');

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'https://job-tracker-gold-ten.vercel.app',
    'https://job-tracker-sarav.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Routes
app.get('/', (req, res) => {
    res.send('Job Tracker Copilot API is running.');
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', copilotRoutes);
app.use(notFound);
app.use(errorHandler);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobtracker')
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error: ', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderCron();

    // Environment validation warnings
    if (!process.env.OPENAI_API_KEY) {
        console.log('\x1b[33m⚠  OPENAI_API_KEY not set — Copilot suggestions will use heuristic fallback.\x1b[0m');
    } else {
        console.log(`✓  OpenAI integration active (model: ${process.env.OPENAI_MODEL || 'gpt-4.1-mini'})`);
    }

    if (!process.env.SMTP_HOST) {
        console.log('\x1b[33m⚠  SMTP not configured — Email reminders are disabled.\x1b[0m');
    }
});
