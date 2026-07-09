/**
 * @module middlewares/requestLogger
 * @description Structured request/response logging middleware.
 *
 * Attaches a unique correlation ID (request_id) to every incoming request,
 * sets it on the response header, and logs request lifecycle events
 * (start + completion) as structured JSON via Winston.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

const HEADER_REQUEST_ID = 'x-request-id';

/**
 * Express middleware that assigns a correlation ID and logs request details.
 *
 * @param {import('../utils/logger')} logger - Winston logger instance.
 * @returns {import('express').RequestHandler}
 */
function createRequestLogger(logger) {
  return (req, res, next) => {
    const requestId = req.headers[HEADER_REQUEST_ID] || `req-${uuidv4()}`;
    const startTime = Date.now();

    // Attach to request for downstream use
    req.requestId = requestId;

    // Set on response header for client traceability
    res.setHeader(HEADER_REQUEST_ID, requestId);

    logger.info('Request received', {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });

    // Log on response finish
    res.on('finish', () => {
      const durationMs = Date.now() - startTime;

      logger.info('Request completed', {
        request_id: requestId,
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: durationMs,
      });
    });

    next();
  };
}

module.exports = { createRequestLogger, HEADER_REQUEST_ID };
