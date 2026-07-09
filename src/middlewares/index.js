/**
 * @module middlewares/index
 * @description Middleware barrel export.
 *
 * Re-exports all middleware factories from a single entry point
 * for clean imports in the application bootstrap.
 */

'use strict';

const { createRequestLogger } = require('./requestLogger');
const { createHelmetMiddleware, createCorsMiddleware } = require('./security');
const { createRateLimiter } = require('./rateLimiter');
const { createErrorHandler } = require('./errorHandler');
const { createUploadGuard } = require('./uploadGuard');

module.exports = {
  createRequestLogger,
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimiter,
  createErrorHandler,
  createUploadGuard,
};
