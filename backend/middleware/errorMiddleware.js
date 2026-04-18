const { HttpError } = require('../utils/httpError');

const notFound = (req, res, next) => {
    const error = new HttpError(404, `Route not found: ${req.originalUrl}`);
    next(error);
};

const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    if (res.headersSent) {
        return next(error);
    }

    res.status(statusCode).json({
        message: error.message || 'Internal server error',
        details: error.details || undefined,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
