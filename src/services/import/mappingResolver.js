/**
 * @module services/import/mappingResolver
 * @description Resolves user-confirmed mappings into a column-index lookup.
 *
 * Builds a fast lookup from the confirmed mapping array and the uploaded
 * headers so the row transformer can convert raw CSV arrays into CRM objects
 * without scanning the mapping list on every row.
 */

'use strict';

const { CRM_FIELD_NAMES } = require('../../constants/crmSchema');

/**
 * Builds a mapping lookup from confirmed mappings and CSV headers.
 *
 * Each entry in the returned array contains the column index in the CSV row,
 * the original uploaded header, and the target CRM field. Unknown CRM fields
 * are collected as warnings and excluded from the lookup.
 *
 * @param {Array<{ uploaded_field: string, mapped_field: string }>} mapping
 *   User-confirmed column-to-field mappings.
 * @param {string[]} headers - Original CSV column headers in order.
 * @returns {{
 *   lookup: Array<{ index: number, uploadedField: string, crmField: string }>,
 *   warnings: string[]
 * }}
 */
function buildMappingLookup(mapping, headers) {
  const lookup = [];
  const warnings = [];

  for (const entry of mapping) {
    const { uploaded_field, mapped_field } = entry;

    // Validate that the target is a known CRM field
    if (!CRM_FIELD_NAMES.includes(mapped_field)) {
      warnings.push(
        `Mapping "${uploaded_field}" → "${mapped_field}" targets an unknown CRM field. Skipped.`
      );
      continue;
    }

    // Find the column index in the CSV headers
    const index = headers.indexOf(uploaded_field);
    if (index === -1) {
      warnings.push(
        `Mapping references header "${uploaded_field}" which does not exist in the CSV. Skipped.`
      );
      continue;
    }

    lookup.push({
      index,
      uploadedField: uploaded_field,
      crmField: mapped_field,
    });
  }

  return { lookup, warnings };
}

module.exports = { buildMappingLookup };
