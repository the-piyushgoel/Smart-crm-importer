/**
 * @module middlewares/errorHandler
 * @description Centralized Express error handling middleware.
 *
 * Intercepts all errors thrown or passed via next(err), categorizes them
 * as operational (AppError) or programmer errors, logs them appropriately,
 * and returns a unified JSON error response.
 */

'use strict';

const AppError = require('../errors/AppError');
const { sendError } = require('../utils/response');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Creates the global error handler middleware.
 *
 * @param {import('winston').Logger} logger - Winston logger instance.
 * @returns {import('express').ErrorRequestHandler}
 */
function createErrorHandler(logger) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, _next) => {
    const requestId = req.requestId || 'unknown';

    // Handle known operational errors
    if (AppError.isAppError(err)) {
      logger.warn('Operational error', {
        request_id: requestId,
        error_code: err.errorCode,
        message: err.message,
        status_code: err.statusCode,
      });

      return sendError(res, err.statusCode, {
        message: err.message,
        errorCode: err.errorCode,
        detail: err.details,
        requestId,
      });
    }

    // Handle Joi validation errors (thrown by middleware validators)
    if (err.isJoi || err.name === 'ValidationError') {
      const detail = err.details
        ? err.details.map((d) => d.message)
        : err.message;

      logger.warn('Validation error', {
        request_id: requestId,
        detail,
      });

      return sendError(res, 400, {
        message: 'Request validation failed.',
        errorCode: ERROR_CODES.GENERAL.VALIDATION_ERROR,
        detail,
        requestId,
      });
    }

    // Handle Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.warn('File size limit exceeded', {
        request_id: requestId,
      });

      return sendError(res, 413, {
        message: 'File size exceeds the maximum allowed limit of 5MB.',
        errorCode: ERROR_CODES.CSV.FILE_TOO_LARGE,
        requestId,
      });
    }

    // Unknown / programmer errors
    logger.error('Unhandled error', {
      request_id: requestId,
      message: err.message,
      stack: err.stack,
    });

    return sendError(res, 500, {
      message: 'An unexpected error occurred. Please try again later.',
      errorCode: ERROR_CODES.GENERAL.INTERNAL_ERROR,
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      requestId,
    });
  };
}

module.exports = { createErrorHandler };
