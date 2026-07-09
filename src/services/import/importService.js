/**
 * @module services/import/importService
 * @description Import execution orchestrator.
 *
 * Coordinates the full import pipeline:
 * 1. Resolve mappings into a column-index lookup.
 * 2. Transform each row using the lookup and field normalizers.
 * 3. Validate each transformed record against business rules.
 * 4. Collect successes, skips, failures, and warnings.
 * 5. Build and return the import summary.
 *
 * Never stops the entire import because of a single bad row.
 */

'use strict';

const logger = require('../../utils/logger');
const { buildMappingLookup } = require('./mappingResolver');
const { transformRow } = require('./rowTransformer');
const { validateRecord } = require('./businessValidator');
const { buildImportSummary } = require('./importSummary');

/**
 * Executes the import pipeline for a set of CSV rows using confirmed mappings.
 *
 * @param {Array<{ uploaded_field: string, mapped_field: string }>} mapping
 *   User-confirmed column-to-CRM-field mappings.
 * @param {string[]} headers - Original CSV column headers.
 * @param {Array<string[]>} rows - Raw CSV data rows (each row is an array of strings).
 * @param {string} requestId - Correlation ID for structured logging.
 * @returns {object} Import summary with records, skipped, failed, warnings, and timing.
 */
function executeImport(mapping, headers, rows, requestId) {
  const startTime = Date.now();
  const childLogger = logger.child({ request_id: requestId });

  childLogger.info('Import started', {
    mapping_count: mapping.length,
    header_count: headers.length,
    row_count: rows.length,
  });

  // 1. Resolve mappings into a fast lookup
  const { lookup, warnings: mappingWarnings } = buildMappingLookup(mapping, headers);
  const warnings = [...mappingWarnings];

  if (mappingWarnings.length > 0) {
    childLogger.warn('Mapping resolution produced warnings', {
      warning_count: mappingWarnings.length,
    });
  }

  const successRecords = [];
  const skippedRecords = [];
  const failedRecords = [];

  // 2. Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

    try {
      // 2a. Transform the raw row into a CRM record
      const { record, fieldWarnings } = transformRow(row, lookup);

      if (fieldWarnings.length > 0) {
        warnings.push(...fieldWarnings);
      }

      // 2b. Validate against business rules
      const { valid, skipReason } = validateRecord(record, rowNumber);

      if (!valid) {
        childLogger.info('Row skipped', { row_number: rowNumber, reason: skipReason });
        skippedRecords.push({
          row_number: rowNumber,
          reason: skipReason,
          raw_data: row,
        });
        continue;
      }

      // 2c. Row passed — add to success records
      successRecords.push({
        row_number: rowNumber,
        data: record,
      });
    } catch (err) {
      childLogger.error('Row processing failed', {
        row_number: rowNumber,
        error: err.message,
      });
      failedRecords.push({
        row_number: rowNumber,
        error: err.message,
        raw_data: row,
      });
    }
  }

  const processingTimeMs = Date.now() - startTime;

  childLogger.info('Import completed', {
    total_rows: rows.length,
    success_count: successRecords.length,
    skipped_count: skippedRecords.length,
    failed_count: failedRecords.length,
    duration_ms: processingTimeMs,
  });

  // 3. Build unified summary
  return buildImportSummary({
    successRecords,
    skippedRecords,
    failedRecords,
    warnings,
    processingTimeMs,
  });
}

module.exports = { executeImport };
