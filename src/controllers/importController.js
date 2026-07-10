/**
 * @module controllers/importController
 * @description Import workflow controller.
 *
 * Coordinates CSV upload processing, preview generation, and schema validation.
 * Keeps controllers thin by offloading business logic to services.
 */

'use strict';

const { processCsvPreview } = require('../services/csv/csvService');
const { ValidationError } = require('../errors');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/v1/import/preview
 *
 * Accepts a CSV file, parses metadata and layout, and returns preview records.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function postPreview(req, res, next) {
  const startTime = Date.now();
  const requestId = req.requestId;

  try {
    // 1. Verify file presence
    if (!req.file) {
      throw new ValidationError('No file uploaded. Please upload a valid CSV file using key "file".');
    }

    const { buffer, originalname } = req.file;

    // 2. Process CSV data stream
    const result = await processCsvPreview(buffer, originalname);

    const processingTimeMs = Date.now() - startTime;

    // 3. Format unified response containing layout object and flat layout variables
    const responseData = {
      file_name: result.file_name,
      total_rows: result.layout.rows_count,
      total_columns: result.layout.columns_count,
      delimiter: result.layout.delimiter,
      encoding: result.layout.encoding,
      detected_headers: result.headers,
      preview_rows: result.preview_rows,
      warnings: result.warnings,
      layout: result.layout
    };

    return sendSuccess(res, 200, {
      message: 'CSV file validated and preview generated successfully.',
      data: responseData,
      metadata: {
        processing_time_ms: processingTimeMs
      },
      warnings: result.warnings,
      requestId
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postPreview
};
