/**
 * @module middlewares/rateLimiter
 * @description Request rate limiting middleware.
 *
 * Protects API endpoints from abuse by limiting the number of requests
 * per IP address within a configurable time window.
 */

'use strict';

const rateLimit = require('express-rate-limit');
const limits = require('../config/limits');
const { sendError } = require('../utils/response');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Creates an Express rate limiter using configuration from limits.js.
 *
 * @returns {import('express').RequestHandler}
 */
function createRateLimiter() {
  return rateLimit({
    windowMs: limits.RATE_LIMIT_WINDOW_MS,
    max: limits.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      sendError(res, 429, {
        message: 'Too many requests. Please try again later.',
        errorCode: ERROR_CODES.GENERAL.RATE_LIMITED,
        requestId: req.requestId,
      });
    },
  });
}

module.exports = { createRateLimiter };
