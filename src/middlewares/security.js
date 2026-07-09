/**
 * @module middlewares/security
 * @description Security middleware configuration.
 *
 * Applies Helmet for HTTP header hardening and configures CORS
 * policies based on environment settings.
 */

'use strict';

const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

/**
 * Creates the Helmet middleware with production-safe defaults.
 *
 * @returns {import('express').RequestHandler}
 */
function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
}

/**
 * Creates the CORS middleware using the configured origin.
 *
 * @returns {import('express').RequestHandler}
 */
function createCorsMiddleware() {
  return cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    credentials: true,
    maxAge: 86400,
  });
}

module.exports = { createHelmetMiddleware, createCorsMiddleware };
