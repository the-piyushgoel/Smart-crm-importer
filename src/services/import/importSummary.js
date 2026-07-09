/**
 * @module services/import/importSummary
 * @description Builds the final import result summary from processing outcomes.
 *
 * Aggregates successful records, skipped records, failed records,
 * warnings, and timing metadata into a unified response payload.
 */

'use strict';

/**
 * Builds the import execution summary.
 *
 * @param {object} options
 * @param {Array<{ row_number: number, data: object }>} options.successRecords
 *   Successfully transformed and validated records.
 * @param {Array<{ row_number: number, reason: string, raw_data: string[] }>} options.skippedRecords
 *   Records skipped due to business rule violations.
 * @param {Array<{ row_number: number, error: string, raw_data: string[] }>} options.failedRecords
 *   Records that failed during transformation.
 * @param {string[]} options.warnings - Non-fatal warnings collected during processing.
 * @param {number} options.processingTimeMs - Total processing duration in milliseconds.
 * @returns {object} Unified import summary payload.
 */
function buildImportSummary({
  successRecords,
  skippedRecords,
  failedRecords,
  warnings,
  processingTimeMs,
}) {
  return {
    summary: {
      total_rows: successRecords.length + skippedRecords.length + failedRecords.length,
      success_count: successRecords.length,
      failed_count: failedRecords.length,
      skipped_count: skippedRecords.length,
      processing_time_ms: processingTimeMs,
    },
    records: successRecords,
    skipped_records: skippedRecords,
    failed_records: failedRecords,
    warnings,
  };
}

module.exports = { buildImportSummary };
