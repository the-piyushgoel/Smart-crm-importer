/**
 * @module routes/healthRoutes
 * @description Health check route registration.
 *
 * Mounts the health endpoint on the API router.
 */

'use strict';

const { Router } = require('express');
const { getHealth } = require('../controllers/healthController');

/**
 * Creates and returns the health check router.
 *
 * @returns {import('express').Router}
 */
function createHealthRouter() {
  const router = Router();

  router.get('/health', getHealth);

  return router;
}

module.exports = { createHealthRouter };
