/**
 * @module controllers/importExecuteController
 * @description Import execution endpoint controller.
 *
 * Accepts confirmed mappings, CSV headers, and data rows. Delegates to
 * the import service for transformation, validation, and summarization.
 * Zero business logic — validation and orchestration only.
 */

'use strict';

const Joi = require('joi');
const { executeImport } = require('../services/import/importService');
const { sendSuccess } = require('../utils/response');
const { ValidationError } = require('../errors');

/**
 * Joi schema for the import execution request payload.
 */
const importExecuteSchema = Joi.object({
  mapping: Joi.array()
    .items(
      Joi.object({
        uploaded_field: Joi.string().required(),
        mapped_field: Joi.string().required(),
      }).unknown(true)
    )
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one mapping entry is required.' }),
  headers: Joi.array()
    .items(Joi.string().allow(''))
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one header is required.' }),
  rows: Joi.array()
    .items(Joi.array().items(Joi.string().allow('', null)))
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one data row is required.' }),
});

/**
 * POST /api/v1/import/execute
 *
 * Executes CRM import using confirmed mappings and raw CSV data.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function postExecute(req, res, next) {
  const requestId = req.requestId;

  try {
    // 1. Validate request payload
    const { error, value } = importExecuteSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      throw new ValidationError('Invalid import execution payload.', details);
    }

    const { mapping, headers, rows } = value;

    // 2. Execute import pipeline
    const result = executeImport(mapping, headers, rows, requestId);

    // 3. Return unified response
    return sendSuccess(res, 200, {
      message: 'Import execution completed.',
      data: result,
      metadata: {
        processing_time_ms: result.summary.processing_time_ms,
      },
      requestId,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postExecute };
