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

  /**
   * @openapi
   * /import/execute:
   *   post:
   *     summary: Execute CRM Import
   *     description: Transforms and validates CSV data based on the provided mapping, and returns the standardized CRM dataset.
   *     tags: [Import]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [mapping, headers, rows]
   *             properties:
   *               mapping:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     uploaded_field:
   *                       type: string
   *                     mapped_field:
   *                       $ref: '#/components/schemas/CRMField'
   *                 description: Array of field mappings.
   *               headers:
   *                 type: array
   *                 items:
   *                   type: string
   *               rows:
   *                 type: array
   *                 items:
   *                   type: array
   *                   items:
   *                     type: string
   *           example:
   *             mapping: [{ "uploaded_field": "Email Address", "mapped_field": "email" }]
   *             headers: ["Email Address"]
   *             rows: [["user@example.com"]]
   *     responses:
   *       200:
   *         description: Import executed successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.post('/import/execute', postExecute);

  return router;
}

module.exports = { createImportExecuteRouter };
