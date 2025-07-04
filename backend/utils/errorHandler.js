/**
 * Async handler for Express routes
 * @param {Function} fn - The async function to handle
 * @returns {Function} Express middleware
 */
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for not found resources
 */
class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for bad requests
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Error for unauthorized access
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Error for forbidden access
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

/**
 * Error for validation failures
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 422);
    this.errors = errors;
  }
}

module.exports = {
  handleAsync,
  APIError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
}; 