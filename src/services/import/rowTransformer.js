/**
 * @module services/import/rowTransformer
 * @description Transforms raw CSV row arrays into normalized CRM record objects.
 *
 * Uses the mapping lookup to extract values by column index and applies
 * field-level normalization via the shared schemaNormalizer.
 */

'use strict';

const { normalizeMappingValue } = require('../ai/schemaNormalizer');
const { CRM_FIELD_NAMES } = require('../../constants/crmSchema');

/**
 * Transforms a single raw CSV row into a normalized CRM record.
 *
 * Iterates through the mapping lookup, extracts the raw value from the
 * row array by column index, and applies normalization. Fields not
 * present in the mapping are set to null.
 *
 * @param {string[]} row - Raw CSV row as an array of string values.
 * @param {Array<{ index: number, uploadedField: string, crmField: string }>} lookup
 *   Resolved mapping lookup from mappingResolver.
 * @returns {{ record: object, fieldWarnings: string[] }}
 *   The normalized CRM record and any field-level warnings.
 */
function transformRow(row, lookup) {
  const record = {};
  const fieldWarnings = [];

  // Initialize all CRM fields to null
  for (const fieldName of CRM_FIELD_NAMES) {
    record[fieldName] = null;
  }

  // Apply mapped values
  for (const entry of lookup) {
    const rawValue = row[entry.index];

    // Handle missing or empty values
    if (rawValue === undefined || rawValue === null || rawValue.trim() === '') {
      record[entry.crmField] = null;
      continue;
    }

    const normalized = normalizeMappingValue(entry.crmField, rawValue);

    if (normalized === null && rawValue.trim() !== '') {
      fieldWarnings.push(
        `Field "${entry.uploadedField}" value "${rawValue}" failed normalization for "${entry.crmField}".`
      );
    }

    record[entry.crmField] = normalized;
  }

  return { record, fieldWarnings };
}

module.exports = { transformRow };
