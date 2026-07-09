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
  console.log('[CSV_SERVICE] 1 — Service entered, fileName:', fileName);
  console.log('[CSV_SERVICE] 2 — Buffer length:', fileBuffer ? fileBuffer.length : 'NULL');
  console.log('[PROMISE] 1 — Promise creating');

  return new Promise((resolve, reject) => {
    console.log('[PROMISE] 2 — Promise created');

    if (!fileBuffer || fileBuffer.length === 0) {
      console.log('[PROMISE] REJECT — Empty file buffer');
      return reject(new CSVParseError('The uploaded file is empty.', { filename: fileName }));
    }

    // 1. Detect delimiter and encoding from buffer head
    const detectorHead = fileBuffer.subarray(0, 8192); // Use first 8KB for layout analysis
    console.log('[CSV_SERVICE] 3 — Layout detection starting, head size:', detectorHead.length);
    const { delimiter, encoding } = detectLayout(detectorHead);
    console.log('[CSV_SERVICE] 4 — Layout detection completed');
    console.log('[CSV_SERVICE] 5 — Delimiter detected:', JSON.stringify(delimiter));
    console.log('[CSV_SERVICE] 6 — Encoding detected:', encoding);

    logger.info('CSV layout detected', { fileName, delimiter, encoding });

    // Initialize metrics
    let headers = [];
    const previewRows = [];
    const warnings = [];
    let totalRows = 0;
    let totalColumns = 0;
    let isHeaderRow = true;

    // 2. Open stream from buffer
    console.log('[BUFFER_STREAM] 1 — Creating buffer stream');
    const bufferStream = Readable.from(fileBuffer);
    console.log('[BUFFER_STREAM] 2 — Buffer stream created');

    // 3. Create decoding stream transform
    console.log('[DECODER_STREAM] 1 — Creating decoder stream');
    const decoderStream = new Transform({
      writableObjectMode: false,
      readableObjectMode: true,
      transform(chunk, _, callback) {
        console.log('[DECODER_STREAM] TRANSFORM — chunk size:', chunk.length);
        try {
          this.push(chunk.toString(encoding));
          callback();
        } catch (err) {
          console.log('[DECODER_STREAM] TRANSFORM ERROR —', err.message);
          callback(err);
        }
      }
    });
    console.log('[DECODER_STREAM] 2 — Decoder stream created');

    // 4. Create CSV parser transform
    console.log('[PARSER_STREAM] 1 — Creating parser stream');
    const parserStream = createParserStream({ delimiter });
    console.log('[PARSER_STREAM] 2 — Parser stream created');

    // --- Stream event instrumentation ---

    // Buffer stream events
    bufferStream.on('data', (chunk) => {
      console.log('[BUFFER_STREAM] EVENT data — chunk size:', chunk.length);
    });
    bufferStream.on('end', () => {
      console.log('[BUFFER_STREAM] EVENT end');
    });
    bufferStream.on('close', () => {
      console.log('[BUFFER_STREAM] EVENT close');
    });
    bufferStream.on('error', (err) => {
      console.log('[BUFFER_STREAM] EVENT error —', err.message);
    });

    // Decoder stream events
    decoderStream.on('data', (chunk) => {
      console.log('[DECODER_STREAM] EVENT data — chunk size:', typeof chunk === 'string' ? chunk.length : 'N/A');
    });
    decoderStream.on('end', () => {
      console.log('[DECODER_STREAM] EVENT end');
    });
    decoderStream.on('finish', () => {
      console.log('[DECODER_STREAM] EVENT finish');
    });
    decoderStream.on('close', () => {
      console.log('[DECODER_STREAM] EVENT close');
    });
    decoderStream.on('error', (err) => {
      console.log('[DECODER_STREAM] EVENT error —', err.message);
    });

    // Parser stream events
    parserStream.on('end', () => {
      console.log('[PARSER_STREAM] EVENT end');
    });
    parserStream.on('finish', () => {
      console.log('[PARSER_STREAM] EVENT finish');
    });
    parserStream.on('close', () => {
      console.log('[PARSER_STREAM] EVENT close');
    });
    parserStream.on('error', (err) => {
      console.log('[PARSER_STREAM] EVENT error —', err.message);
    });

    // Handle stream errors (original logic preserved)
    const handleError = (err) => {
      logger.error('Error during CSV stream parsing', { fileName, err: err.message });
      console.log('[PROMISE] REJECT — Stream error:', err.message, err.stack);
      reject(new CSVParseError(`Failed to parse CSV file: ${err.message}`, { filename: fileName }));
    };

    bufferStream.on('error', handleError);
    decoderStream.on('error', handleError);
    parserStream.on('error', handleError);

    // 5. Read parsed rows
    parserStream.on('data', (row) => {
      // Row must be an array of values
      if (!Array.isArray(row)) {
        console.log('[PARSER_STREAM] EVENT data — non-array row skipped');
        return;
      }

      // Handle header row extraction
      if (isHeaderRow) {
        headers = row.map(h => h.trim());
        console.log('[CSV_SERVICE] HEADERS — extracted:', headers);
        console.log('[CSV_SERVICE] HEADERS — count:', headers.length);

        // Validation: Ensure headers are not empty
        const validHeadersCount = headers.filter(h => h !== '').length;
        if (validHeadersCount === 0) {
          parserStream.destroy();
          console.log('[PROMISE] REJECT — No valid headers');
          return reject(new CSVParseError('CSV file does not contain a valid header row.'));
        }

        totalColumns = headers.length;
        isHeaderRow = false;
        return;
      }

      // Increment data rows count
      totalRows++;
      console.log('[PARSER_STREAM] EVENT data — Row #' + totalRows + ', columns:', row.length);

      // Enforce operational row limit
      if (totalRows > limits.MAX_ROW_COUNT) {
        parserStream.destroy();
        console.log('[PROMISE] REJECT — Row limit exceeded at row', totalRows);
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
          console.log('[CSV_SERVICE] WARNING —', warningText);
          warnings.push(warningText);
        }
      }

      // Capture preview rows up to MAX_PREVIEW_ROWS limit
      if (previewRows.length < limits.MAX_PREVIEW_ROWS) {
        console.log('[CSV_SERVICE] PREVIEW — storing preview row index:', previewRows.length);
        previewRows.push(row);
      }
    });

    // 6. Finalize on stream end
    parserStream.on('end', () => {
      console.log('[PARSER_STREAM] EVENT end — finalizing, totalRows:', totalRows);

      // Validation: Check for empty data content
      if (totalRows === 0) {
        console.log('[PROMISE] REJECT — No data rows');
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

      console.log('[CSV_SERVICE] COMPLETE — CSV processing completed successfully');
      console.log('[PROMISE] RESOLVE — resolving with', totalRows, 'rows,', previewRows.length, 'preview rows');
      resolve({
        file_name: fileName,
        layout,
        headers,
        preview_rows: previewRows,
        warnings
      });
    });

    // Pipe the pipeline
    console.log('[CSV_SERVICE] PIPELINE — Pipeline starting');
    bufferStream.pipe(decoderStream).pipe(parserStream);
    console.log('[CSV_SERVICE] PIPELINE — Pipeline connected');
  });
}

module.exports = {
  processCsvPreview
};
