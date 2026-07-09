'use strict';

const AppError = require('./AppError');
const { errorCodes } = require('../constants');

/**
 * Thrown when request data fails validation (e.g. missing fields, bad types).
 *
 * @extends AppError
 */
class ValidationError extends AppError {
  /**
   * @param {string} message - Description of what failed validation.
   * @param {*} [details] - Validation details (e.g. Joi error array).
   */
  constructor(message, details) {
    super(message, 400, errorCodes.GENERAL.VALIDATION_ERROR, details);
  }
}

/**
 * Thrown when a requested resource does not exist.
 *
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * @param {string} message - Description of the missing resource.
   */
  constructor(message) {
    super(message, 404, errorCodes.GENERAL.NOT_FOUND);
  }
}

/**
 * Thrown when a CSV file cannot be parsed or has structural issues.
 *
 * @extends AppError
 */
class CSVParseError extends AppError {
  /**
   * @param {string} message - Description of the parse failure.
   * @param {*} [details] - Parse error context (line number, column, raw value).
   */
  constructor(message, details) {
    super(message, 422, errorCodes.CSV.INVALID_FILE, details);
  }
}

/**
 * Thrown when an AI provider request fails (timeout, network error, 5xx).
 *
 * @extends AppError
 */
class AIProviderError extends AppError {
  /**
   * @param {string} message - Description of the provider failure.
   * @param {*} [details] - Provider response or timeout context.
   */
  constructor(message, details) {
    super(message, 502, errorCodes.AI.PROVIDER_TIMEOUT, details);
  }
}

/**
 * Thrown when the AI provider returns a response that cannot be parsed
 * or does not conform to the expected schema.
 *
 * @extends AppError
 */
class AIResponseError extends AppError {
  /**
   * @param {string} message - Description of the response issue.
   * @param {*} [details] - Raw response or parsing failure info.
   */
  constructor(message, details) {
    super(message, 422, errorCodes.AI.INVALID_RESPONSE, details);
  }
}

/**
 * Thrown when a client exceeds the rate limit.
 * Uses a fixed message since rate limit responses should be uniform.
 *
 * @extends AppError
 */
class RateLimitError extends AppError {
  constructor() {
    super(
      'Too many requests. Please try again later.',
      429,
      errorCodes.GENERAL.RATE_LIMITED
    );
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  CSVParseError,
  AIProviderError,
  AIResponseError,
  RateLimitError,
};
