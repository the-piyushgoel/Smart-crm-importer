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

  /**
   * @openapi
   * /import/preview:
   *   post:
   *     summary: Upload and preview CSV file
   *     description: Uploads a CSV file, detects its delimiter and encoding, and returns metadata alongside a preview of the first 10 rows.
   *     tags: [Import]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: The CSV file to upload (max 5MB).
   *     responses:
   *       200:
   *         description: CSV processed successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       422:
   *         $ref: '#/components/responses/UnprocessableEntity'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.post('/import/preview', upload.single('file'), postPreview);

  return router;
}

module.exports = {
  createImportRouter
};
