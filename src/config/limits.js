/**
 * Operational limits and constraints for the application.
 * @type {Readonly<{
 *   MAX_FILE_SIZE_BYTES: number,
 *   MAX_ROW_COUNT: number,
 *   MAX_PREVIEW_ROWS: number,
 *   RATE_LIMIT_WINDOW_MS: number,
 *   RATE_LIMIT_MAX_REQUESTS: number,
 *   ALLOWED_MIME_TYPES: readonly string[],
 *   ALLOWED_EXTENSIONS: readonly string[],
 * }>}
 */
const LIMITS = Object.freeze({
  /** 5 MB maximum upload size */
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,

  /** Maximum number of data rows in a single CSV */
  MAX_ROW_COUNT: 50000,

  /** Number of rows returned in a preview response */
  MAX_PREVIEW_ROWS: 25,

  /** Rate-limit sliding window duration (15 minutes) */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,

  /** Maximum requests allowed within the rate-limit window */
  RATE_LIMIT_MAX_REQUESTS: 100,

  /** MIME types accepted for CSV upload */
  ALLOWED_MIME_TYPES: Object.freeze(['text/csv', 'application/vnd.ms-excel']),

  /** File extensions accepted for CSV upload */
  ALLOWED_EXTENSIONS: Object.freeze(['.csv']),
});

module.exports = LIMITS;
