/**
 * @module services/csv/csvParser
 * @description Stream parser transformer wrapping csv-parse.
 *
 * Configures the csv-parse stream to parse incoming text chunks into row arrays.
 * Handles row trimming, skip empty lines, and column count relaxation to allow
 * safe parsing of malformed rows without crashing the stream.
 */

'use strict';

const { parse } = require('csv-parse');

/**
 * Creates a CSV parser transform stream.
 *
 * @param {object} options
 * @param {string} options.delimiter - Column delimiter character.
 * @returns {import('stream').Transform} The configured csv-parse transform stream.
 */
function createParserStream({ delimiter }) {
  return parse({
    delimiter: delimiter,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Prevents crashing on rows with mismatched column counts
    bom: true,                 // Automatically strips BOM character if present
  });
}

module.exports = {
  createParserStream
};
