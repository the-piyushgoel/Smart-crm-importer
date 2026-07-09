/**
 * @module routes/importRoutes
 * @description Import endpoints routing registration.
 *
 * Mounts CSV upload guards and controllers on API routers.
 */

'use strict';

const { Router } = require('express');
const { postPreview } = require('../controllers/importController');
const { createUploadGuard } = require('../middlewares');

/**
 * Creates and returns the import endpoints router.
 *
 * @returns {import('express').Router}
 */
function createImportRouter() {
  const router = Router();
  const upload = createUploadGuard();

  // Route to preview CSV before sending to AI
  router.post('/import/preview', upload.single('file'), postPreview);

  return router;
}

module.exports = {
  createImportRouter
};
