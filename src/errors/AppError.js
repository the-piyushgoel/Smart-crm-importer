'use strict';

/**
 * Base application error class.
 * Extends the native Error with HTTP status codes, machine-readable
 * error codes, and an operational flag to distinguish expected failures
 * from programmer bugs.
 *
 * @extends Error
 */
class AppError extends Error {
  /**
   * Creates a new AppError.
   *
   * @param {string} message - Human-readable error description.
   * @param {number} statusCode - HTTP status code for the response.
   * @param {string} errorCode - Machine-readable code from errorCodes constants.
   * @param {*} [details] - Optional debug information (validation details, raw responses, etc.).
   */
  constructor(message, statusCode, errorCode, details) {
    super(message);

    /** @type {number} HTTP status code */
    this.statusCode = statusCode;

    /** @type {string} Machine-readable error code from constants */
    this.errorCode = errorCode;

    /**
     * Distinguishes operational errors (expected failures like bad input)
     * from programmer errors (bugs). Operational errors are safe to
     * expose to clients; programmer errors should trigger alerts.
     *
     * @type {boolean}
     */
    this.isOperational = true;

    /** @type {*} Optional debug/context information */
    this.details = details;

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Checks whether a given error is an instance of AppError.
   *
   * @param {Error} err - The error to check.
   * @returns {boolean} True if the error is an AppError instance.
   *
   * @example
   * if (AppError.isAppError(err)) {
   *   res.status(err.statusCode).json({ error: err.errorCode });
   * }
   */
  static isAppError(err) {
    return err instanceof AppError;
  }
}

module.exports = AppError;
