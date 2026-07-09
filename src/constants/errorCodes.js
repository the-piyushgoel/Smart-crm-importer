/**
 * Application error codes organized by domain.
 * Used for consistent, machine-readable error identification across
 * services, controllers, and middleware.
 *
 * @type {Readonly<{
 *   GENERAL: Readonly<{
 *     INTERNAL_ERROR: string,
 *     VALIDATION_ERROR: string,
 *     NOT_FOUND: string,
 *     RATE_LIMITED: string,
 *   }>,
 *   CSV: Readonly<{
 *     INVALID_FILE: string,
 *     EMPTY_FILE: string,
 *     DELIMITER_NOT_FOUND: string,
 *     UNSUPPORTED_FORMAT: string,
 *     FILE_TOO_LARGE: string,
 *   }>,
 *   AI: Readonly<{
 *     PROVIDER_TIMEOUT: string,
 *     INVALID_RESPONSE: string,
 *     RATE_LIMITED: string,
 *     MAPPING_FAILED: string,
 *   }>,
 *   IMPORT: Readonly<{
 *     NO_VALID_ROWS: string,
 *     PARTIAL_SUCCESS: string,
 *   }>,
 * }>}
 */
const ERROR_CODES = Object.freeze({
  GENERAL: Object.freeze({
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMITED: 'RATE_LIMITED',
  }),

  CSV: Object.freeze({
    INVALID_FILE: 'CSV_INVALID_FILE',
    EMPTY_FILE: 'CSV_EMPTY_FILE',
    DELIMITER_NOT_FOUND: 'CSV_DELIMITER_NOT_FOUND',
    UNSUPPORTED_FORMAT: 'CSV_UNSUPPORTED_FORMAT',
    FILE_TOO_LARGE: 'CSV_FILE_TOO_LARGE',
  }),

  AI: Object.freeze({
    PROVIDER_TIMEOUT: 'AI_PROVIDER_TIMEOUT',
    INVALID_RESPONSE: 'AI_INVALID_RESPONSE',
    RATE_LIMITED: 'AI_RATE_LIMITED',
    MAPPING_FAILED: 'AI_MAPPING_FAILED',
  }),

  IMPORT: Object.freeze({
    NO_VALID_ROWS: 'IMPORT_NO_VALID_ROWS',
    PARTIAL_SUCCESS: 'IMPORT_PARTIAL_SUCCESS',
  }),
});

module.exports = ERROR_CODES;
