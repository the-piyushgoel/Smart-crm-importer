/**
 * @module controllers/mappingController
 * @description AI mapping endpoint controller.
 *
 * Accepts CSV headers and sample rows, orchestrates the mapping service,
 * and returns the unified mapping response. Zero business logic.
 */

'use strict';

const Joi = require('joi');
const { generateMappings } = require('../services/ai/mappingService');
const { sendSuccess } = require('../utils/response');
const { ValidationError } = require('../errors');

/**
 * Joi schema for the mapping request payload.
 */
const mappingRequestSchema = Joi.object({
  headers: Joi.array()
    .items(Joi.string().allow(''))
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one header is required.' }),
  preview_rows: Joi.array()
    .items(Joi.array().items(Joi.string().allow('', null)))
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one preview row is required.' }),
});

/**
 * POST /api/v1/import/mapping
 *
 * Generates AI-powered column mappings from CSV headers to CRM fields.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function postMapping(req, res, next) {
  const startTime = Date.now();
  const requestId = req.requestId;

  try {
    // 1. Validate request payload
    const { error, value } = mappingRequestSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      throw new ValidationError('Invalid mapping request payload.', details);
    }

    const { headers, preview_rows } = value;

    // 2. Generate mappings
    const result = await generateMappings(headers, preview_rows, requestId);

    const processingTimeMs = Date.now() - startTime;

    // 3. Return unified response
    return sendSuccess(res, 200, {
      message: 'AI mapping generated.',
      data: {
        mappings: result.mappings,
      },
      metadata: {
        ...result.metadata,
        processing_time_ms: processingTimeMs,
      },
      requestId,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postMapping };
