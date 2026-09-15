// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error = new AppError(`Duplicate field value: ${field}. Please use another value.`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired. Please log in again.', 401);
    }

    sendErrorProd(error, res);
  }
};

// Send error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
