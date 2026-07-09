/**
 * @module services/csv/csvDetector
 * @description Delimiter and encoding detection for uploaded CSV files.
 *
 * Analyzes file headers/buffers to determine the character encoding and
 * column delimiter before parsing. Supports UTF-8 (with or without BOM)
 * and is structured for future multi-encoding support.
 */

'use strict';

const logger = require('../../utils/logger');

// Common delimiters to scan for frequency analysis
const COMMON_DELIMITERS = [',', ';', '\t', '|'];

/**
 * Detects the character encoding of a file buffer by analyzing its Byte Order Mark (BOM).
 * Defaults to 'utf-8' if no BOM is matched.
 *
 * @param {Buffer} buffer - The initial chunk of the uploaded file.
 * @returns {string} The detected encoding (e.g., 'utf-8', 'utf16le', 'utf16be').
 */
function detectEncoding(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return 'utf-8';
  }

  // UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    logger.debug('UTF-8 BOM detected');
    return 'utf-8';
  }

  // UTF-16 LE BOM
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    logger.debug('UTF-16 LE BOM detected');
    return 'utf16le';
  }

  // UTF-16 BE BOM
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    logger.debug('UTF-16 BE BOM detected');
    return 'utf16be';
  }

  // Default to utf-8
  return 'utf-8';
}

/**
 * Detects the column delimiter by scanning the first line(s) of the file content.
 * Counts occurrences of common delimiters and returns the one with the highest frequency.
 *
 * @param {string} text - The decoded head of the file.
 * @returns {string} The detected delimiter (defaults to comma ',').
 */
function detectDelimiter(text) {
  if (!text) {
    return ',';
  }

  // Read up to the first newline to analyze the header line
  const firstLine = text.split(/\r?\n/)[0];
  
  const counts = {};
  let maxCount = 0;
  let detectedDelimiter = ',';

  for (const delimiter of COMMON_DELIMITERS) {
    // Escape delimiter for regex matching (especially for pipe and tab)
    const escapedDelimiter = delimiter === '|' ? '\\|' : delimiter;
    const occurrences = (firstLine.match(new RegExp(escapedDelimiter, 'g')) || []).length;
    counts[delimiter] = occurrences;

    if (occurrences > maxCount) {
      maxCount = occurrences;
      detectedDelimiter = delimiter;
    }
  }

  logger.debug('Delimiter frequency analysis completed', { counts, selected: detectedDelimiter });
  return detectedDelimiter;
}

/**
 * Analyzes a file buffer chunk to detect both encoding and delimiter.
 *
 * @param {Buffer} buffer - The buffer header (typically first 4-8KB).
 * @returns {{ delimiter: string, encoding: string }} The detected file properties.
 */
function detectLayout(buffer) {
  const encoding = detectEncoding(buffer);
  
  // Decode the buffer to string using the detected encoding for delimiter parsing
  let text = '';
  try {
    text = buffer.toString(encoding);
  } catch (err) {
    logger.error('Failed to decode layout detection buffer', { encoding, err: err.message });
    text = buffer.toString('utf-8'); // Fallback
  }

  const delimiter = detectDelimiter(text);

  return {
    delimiter,
    encoding
  };
}

module.exports = {
  detectEncoding,
  detectDelimiter,
  detectLayout
};
