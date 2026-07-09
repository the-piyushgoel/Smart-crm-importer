/**
 * @module services/import/businessValidator
 * @description Business rule validation for transformed CRM records.
 *
 * Enforces rules that cannot be expressed as simple field normalization,
 * such as the requirement that every record must contain at least an email
 * or a phone number to be importable.
 */

'use strict';

/**
 * Validates a transformed CRM record against business rules.
 *
 * Current rules:
 * 1. A record must contain either a non-null email or a non-null phone.
 *    Records missing both are skipped (Rule 7).
 *
 * @param {object} record - Transformed CRM record.
 * @param {number} rowNumber - 1-based row number for error reporting.
 * @returns {{ valid: boolean, skipReason: string | null }}
 */
function validateRecord(record, rowNumber) {
  const hasEmail = record.email !== null && record.email !== '';
  const hasPhone = record.phone !== null && record.phone !== '';

  if (!hasEmail && !hasPhone) {
    return {
      valid: false,
      skipReason: `Row ${rowNumber}: Missing both email and phone (Rule 7). Record skipped.`,
    };
  }

  return { valid: true, skipReason: null };
}

module.exports = { validateRecord };
