/**
 * @module routes/mappingRoutes
 * @description Express routes for AI-powered CSV mapping.
 */

'use strict';

const { Router } = require('express');
const { postMapping } = require('../controllers/mappingController');

/**
 * Creates and returns the mapping endpoints router.
 *
 * @returns {import('express').Router}
 */
function createMappingRouter() {
  const router = Router();

  // Route to generate AI mappings
  router.post('/import/mapping', postMapping);

  return router;
}

module.exports = {
  createMappingRouter
};
