/**
 * @module controllers/healthController
 * @description Health check controller.
 *
 * Provides a lightweight endpoint for infrastructure probes
 * (load balancers, container orchestrators, uptime monitors).
 * Contains zero business logic per architecture rules.
 */

'use strict';

const { sendSuccess } = require('../utils/response');

/**
 * GET /api/v1/health
 *
 * Returns server status, uptime, and current timestamp.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getHealth(req, res) {
  sendSuccess(res, 200, {
    message: 'GrowEasy CSV Importer API is healthy.',
    data: {
      status: 'ok',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    requestId: req.requestId,
  });
}

module.exports = { getHealth };
