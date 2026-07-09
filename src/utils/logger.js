'use strict';

const winston = require('winston');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = NODE_ENV === 'development';

/**
 * Structured JSON format shared across all transports.
 * Produces log entries with timestamp, level, message, and any
 * additional metadata spread into the JSON object.
 *
 * @type {winston.Logform.Format}
 */
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Colorized console format for local development readability.
 * Prints level, timestamp, message, and stringified metadata.
 *
 * @type {winston.Logform.Format}
 */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const line = `${timestamp} ${level}: ${message}${metaStr}`;
    return stack ? `${line}\n${stack}` : line;
  })
);

/**
 * Build the list of transports based on the current environment.
 *
 * @returns {winston.transport[]} Array of configured transports.
 */
function buildTransports() {
  const transports = [];

  transports.push(
    new winston.transports.Console({
      format: IS_DEVELOPMENT ? devFormat : structuredFormat,
    })
  );

  return transports;
}

/**
 * Application-wide singleton logger instance.
 * Outputs structured JSON in production, colorized human-readable
 * text in development.
 *
 * @type {winston.Logger}
 *
 * @example
 * const logger = require('../utils/logger');
 * logger.info('Server started', { port: 3000 });
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'groweasy-csv-importer' },
  format: structuredFormat,
  transports: buildTransports(),
});

/**
 * Creates a child logger with pre-bound metadata.
 * Useful for attaching request-scoped or job-scoped context
 * that appears in every subsequent log entry.
 *
 * @param {Object} meta - Metadata to bind to every log entry.
 * @param {string} [meta.request_id] - Unique request identifier.
 * @param {string} [meta.job_id] - CSV import job identifier.
 * @returns {winston.Logger} A child logger with the bound metadata.
 *
 * @example
 * const child = createChildLogger({ request_id: 'abc-123' });
 * child.info('Processing request'); // includes request_id in output
 */
function createChildLogger(meta) {
  return logger.child(meta);
}

logger.createChildLogger = createChildLogger;

module.exports = logger;
