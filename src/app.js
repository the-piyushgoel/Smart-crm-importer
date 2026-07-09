/**
 * @module app
 * @description Application entry point for the GrowEasy CSV Importer API.
 *
 * Bootstraps Express with security middlewares, structured logging,
 * correlation ID tracking, rate limiting, and centralized error handling.
 * Mounts route modules and starts the HTTP server.
 *
 * This file orchestrates initialization only — zero business logic lives here.
 */

'use strict';

const express = require('express');
const env = require('./config/env');
const logger = require('./utils/logger');
const {
  createRequestLogger,
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimiter,
  createErrorHandler,
} = require('./middlewares');
const { createHealthRouter } = require('./routes/healthRoutes');
const { createImportRouter } = require('./routes/importRoutes');
const { createMappingRouter } = require('./routes/mappingRoutes');
const { createImportExecuteRouter } = require('./routes/importExecuteRoutes');
const { sendError } = require('./utils/response');
const ERROR_CODES = require('./constants/errorCodes');

// ---------------------------------------------------------------------------
// Application bootstrap
// ---------------------------------------------------------------------------

const app = express();

// --- Security layer ---
app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());

// --- Request parsing ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// --- Correlation ID & structured logging ---
app.use(createRequestLogger(logger));

// --- Rate limiting ---
app.use('/api/', createRateLimiter());

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

app.use('/api/v1', createHealthRouter());
app.use('/api/v1', createImportRouter());
app.use('/api/v1', createMappingRouter());
app.use('/api/v1', createImportExecuteRouter());

// ---------------------------------------------------------------------------
// 404 handler — catch unmatched routes
// ---------------------------------------------------------------------------

app.use((req, res) => {
  sendError(res, 404, {
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    errorCode: ERROR_CODES.GENERAL.NOT_FOUND,
    requestId: req.requestId,
  });
});

// ---------------------------------------------------------------------------
// Global error handler — must be registered last
// ---------------------------------------------------------------------------

app.use(createErrorHandler(logger));

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: env.NODE_ENV,
    ai_provider: env.AI_PROVIDER,
  });
});

module.exports = app;
