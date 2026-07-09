/**
 * @module middlewares/uploadGuard
 * @description Multipart file upload guard middleware.
 *
 * Configures Multer to accept only CSV files within size limits.
 * Rejects unsupported file types and oversized uploads early in
 * the request pipeline to protect downstream resources.
 */

'use strict';

const multer = require('multer');
const path = require('path');
const limits = require('../config/limits');
const { CSVParseError } = require('../errors');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Multer file filter that validates MIME type and file extension.
 *
 * @param {import('express').Request} _req
 * @param {Express.Multer.File} file
 * @param {function} cb
 */
function csvFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!limits.ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new CSVParseError(
        `Unsupported file extension "${ext}". Only .csv files are accepted.`,
        { extension: ext, code: ERROR_CODES.CSV.UNSUPPORTED_FORMAT }
      )
    );
  }

  cb(null, true);
}

/**
 * Creates a configured Multer middleware instance for CSV uploads.
 * Uses memory storage (buffer) for stream-based processing.
 *
 * @returns {import('multer').Multer}
 */
function createUploadGuard() {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: limits.MAX_FILE_SIZE_BYTES,
      files: 1,
    },
    fileFilter: csvFileFilter,
  });
}

module.exports = { createUploadGuard };
