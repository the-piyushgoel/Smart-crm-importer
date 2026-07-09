/**
 * @module utils/response
 * @description Unified API response builder for the GrowEasy CSV Importer.
 *
 * Every endpoint uses this helper to ensure consistent JSON payloads.
 * Follows the JSend-inspired response standard defined in the architecture spec.
 */

'use strict';

/**
 * Builds a standardized success response payload.
 *
 * @param {object} options
 * @param {string} options.message - User-friendly summary of the outcome.
 * @param {*}      [options.data=null] - Primary response payload.
 * @param {object} [options.metadata={}] - Processing metadata (timing, counts).
 * @param {string[]} [options.warnings=[]] - Non-fatal warning messages.
 * @param {string} options.requestId - Correlation ID for the request.
 * @returns {object} Formatted response body.
 */
function buildSuccess({ message, data = null, metadata = {}, warnings = [], requestId }) {
  return {
    success: true,
    message,
    data,
    metadata,
    warnings,
    errors: [],
    request_id: requestId,
  };
}

/**
 * Builds a standardized error response payload.
 *
 * @param {object} options
 * @param {string} options.message - User-friendly error summary.
 * @param {string} options.errorCode - Machine-readable error code from constants.
 * @param {*}      [options.detail=null] - Debug info (stripped in production).
 * @param {string[]} [options.warnings=[]] - Non-fatal warning messages.
 * @param {string} options.requestId - Correlation ID for the request.
 * @returns {object} Formatted error response body.
 */
function buildError({ message, errorCode, detail = null, warnings = [], requestId }) {
  const errorEntry = { code: errorCode, message };

  if (process.env.NODE_ENV !== 'production' && detail) {
    errorEntry.detail = detail;
  }

  return {
    success: false,
    message,
    data: null,
    metadata: {},
    warnings,
    errors: [errorEntry],
    request_id: requestId,
  };
}

/**
 * Sends a standardized success response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g. 200, 201, 202).
 * @param {object} options - Options passed to buildSuccess.
 */
function sendSuccess(res, statusCode, options) {
  const body = buildSuccess(options);
  return res.status(statusCode).json(body);
}

/**
 * Sends a standardized error response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500).
 * @param {object} options - Options passed to buildError.
 */
function sendError(res, statusCode, options) {
  const body = buildError(options);
  return res.status(statusCode).json(body);
}

module.exports = { buildSuccess, buildError, sendSuccess, sendError };
