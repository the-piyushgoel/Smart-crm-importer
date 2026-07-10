/**
 * @module services/csv/csvService
 * @description CSV processing orchestrator.
 *
 * Coordinates delimiter/encoding detection, stream parsing, layout validation,
 * row/column counting, and preview row extraction. Enforces size limits,
 * empty checks, and formats metadata for the preview response.
 */

'use strict';

const { Readable, Transform } = require('stream');
const logger = require('../../utils/logger');
const limits = require('../../config/limits');
const { detectLayout } = require('./csvDetector');
const { createParserStream } = require('./csvParser');
const { CSVParseError } = require('../../errors');

/**
 * Processes a CSV file buffer using streams to generate metadata and preview records.
 *
 * @param {Buffer} fileBuffer - The complete file buffer from Multer.
 * @param {string} fileName - Original file name for logging and metadata.
 * @returns {Promise<object>} Parsed metadata and preview rows.
 * @throws {CSVParseError} If the CSV is empty, malformed, or exceeds row limits.
 */
function processCsvPreview(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || fileBuffer.length === 0) {
      return reject(new CSVParseError('The uploaded file is empty.', { filename: fileName }));
    }

    // 1. Detect delimiter and encoding from buffer head
    const detectorHead = fileBuffer.subarray(0, 8192); // Use first 8KB for layout analysis
    const { delimiter, encoding } = detectLayout(detectorHead);

    logger.info('CSV layout detected', { fileName, delimiter, encoding });

    // Initialize metrics
    let headers = [];
    const previewRows = [];
    const warnings = [];
    let totalRows = 0;
    let totalColumns = 0;
    let isHeaderRow = true;

    // 2. Open stream from buffer
    const bufferStream = Readable.from(fileBuffer);

    // 3. Create decoding stream transform
    const decoderStream = new Transform({
      writableObjectMode: false,
      readableObjectMode: true,
      transform(chunk, _, callback) {
        try {
          this.push(chunk.toString(encoding));
          callback();
        } catch (err) {
          callback(err);
        }
      }
    });

    // 4. Create CSV parser transform
    const parserStream = createParserStream({ delimiter });

    // Handle stream errors (original logic preserved)
    const handleError = (err) => {
      logger.error('Error during CSV stream parsing', { fileName, err: err.message });
      reject(new CSVParseError(`Failed to parse CSV file: ${err.message}`, { filename: fileName }));
    };

    bufferStream.on('error', handleError);
    decoderStream.on('error', handleError);
    parserStream.on('error', handleError);

    // 5. Read parsed rows
    parserStream.on('data', (row) => {
      // Row must be an array of values
      if (!Array.isArray(row)) {
        return;
      }

      // Handle header row extraction
      if (isHeaderRow) {
        headers = row.map(h => h.trim());

        // Validation: Ensure headers are not empty
        const validHeadersCount = headers.filter(h => h !== '').length;
        if (validHeadersCount === 0) {
          parserStream.destroy();
          return reject(new CSVParseError('CSV file does not contain a valid header row.'));
        }

        totalColumns = headers.length;
        isHeaderRow = false;
        return;
      }

      // Increment data rows count
      totalRows++;

      // Enforce operational row limit
      if (totalRows > limits.MAX_ROW_COUNT) {
        parserStream.destroy();
        return reject(
          new CSVParseError(`CSV file exceeds maximum row limit of ${limits.MAX_ROW_COUNT} rows.`, {
            max_limit: limits.MAX_ROW_COUNT
          })
        );
      }

      // Check column count validation (detect malformed row lengths)
      if (row.length !== totalColumns) {
        // Track the maximum column size observed to report accurate metrics
        if (row.length > totalColumns) {
          totalColumns = row.length;
        }

        // Log non-fatal warning for the specific row mismatch
        if (warnings.length < 50) { // Cap warning messages to prevent memory bloat
          const warningText = `Row ${totalRows} contains ${row.length} columns, expected ${headers.length}.`;
          warnings.push(warningText);
        }
      }

      // Capture preview rows up to MAX_PREVIEW_ROWS limit
      if (previewRows.length < limits.MAX_PREVIEW_ROWS) {
        previewRows.push(row);
      }
    });

    // 6. Finalize on stream end
    parserStream.on('end', () => {

      // Validation: Check for empty data content
      if (totalRows === 0) {
        return reject(new CSVParseError('CSV file contains a header row but no valid data rows.'));
      }

      const layout = {
        columns_count: totalColumns,
        rows_count: totalRows,
        delimiter,
        encoding,
        header_row_detected: true,
        order_independent: true
      };

      resolve({
        file_name: fileName,
        layout,
        headers,
        preview_rows: previewRows,
        warnings
      });
    });

    // Pipe the pipeline
    bufferStream.pipe(decoderStream).pipe(parserStream);
  });
}

module.exports = {
  processCsvPreview
};
