export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected server error occurred.';

  if (error.code === 11000) {
    statusCode = 409;
    message = 'An account with this email address already exists.';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'One or more supplied values are invalid.';
  }

  const response = { success: false, message };
  if (error.details) response.errors = error.details;
  if (process.env.NODE_ENV !== 'production' && !error.isOperational) response.stack = error.stack;

  res.status(statusCode).json(response);
};
