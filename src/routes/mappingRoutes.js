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

  /**
   * @openapi
   * /import/mapping:
   *   post:
   *     summary: Generate AI Mapping for CSV Headers
   *     description: Analyzes CSV headers and sample data using AI to suggest mappings to the standard CRM schema.
   *     tags: [Import]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [headers, preview_rows]
   *             properties:
   *               headers:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of CSV headers.
   *               preview_rows:
   *                 type: array
   *                 items:
   *                   type: array
   *                   items:
   *                     type: string
   *                 description: Array of sample data rows.
   *           example:
   *             headers: ["First Name", "Email Address"]
   *             preview_rows: [["John", "john@example.com"]]
   *     responses:
   *       200:
   *         description: Mappings generated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.post('/import/mapping', postMapping);

  return router;
}

module.exports = {
  createMappingRouter
};
