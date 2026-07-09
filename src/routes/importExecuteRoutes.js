/**
 * @module routes/importExecuteRoutes
 * @description Express routes for import execution.
 */

'use strict';

const { Router } = require('express');
const { postExecute } = require('../controllers/importExecuteController');

/**
 * Creates and returns the import execution router.
 *
 * @returns {import('express').Router}
 */
function createImportExecuteRouter() {
  const router = Router();

  // Route to execute CRM import with confirmed mappings
  router.post('/import/execute', postExecute);

  return router;
}

module.exports = { createImportExecuteRouter };
