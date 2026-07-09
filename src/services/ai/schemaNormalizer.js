/**
 * @module services/ai/schemaNormalizer
 * @description Normalizes mapped values based on CRM field type rules and
 * provides header normalization for fuzzy field comparison.
 *
 * Each field type has specific cleaning/validation logic. Invalid values
 * return null so the caller can decide on fallback behavior.
 */

'use strict';

const { ALLOWED_STATUSES, ALLOWED_SOURCES } = require('../../constants/crmSchema');

/** Basic email validation pattern — must contain an @ symbol. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

/** Characters stripped when normalizing headers for comparison. */
const HEADER_STRIP_PATTERN = /[-_.\s]+/g;

/**
 * Normalizes an email value.
 *
 * @param {string} value - Raw email string.
 * @returns {string|null} Cleaned email or null if invalid.
 */
function normalizeEmail(value) {
  const cleaned = value.trim().toLowerCase();
  return EMAIL_REGEX.test(cleaned) ? cleaned : null;
}

/**
 * Normalizes a phone number by stripping non-numeric characters except a leading +.
 *
 * @param {string} value - Raw phone string.
 * @returns {string} Cleaned phone string.
 */
function normalizePhone(value) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  return hasLeadingPlus ? `+${digits}` : digits;
}

/**
 * Normalizes a website URL, prepending https:// if no protocol is present.
 *
 * @param {string} value - Raw URL string.
 * @returns {string|null} Cleaned URL or null if empty.
 */
function normalizeWebsite(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Normalizes a LinkedIn URL, validating it contains 'linkedin.com'.
 *
 * @param {string} value - Raw LinkedIn URL string.
 * @returns {string|null} Cleaned URL or null if not a LinkedIn URL.
 */
function normalizeLinkedin(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.toLowerCase().includes('linkedin.com') ? trimmed : null;
}

/**
 * Normalizes a status value against the allowed status list.
 *
 * @param {string} value - Raw status string.
 * @returns {string|null} Matched status or null if no match.
 */
function normalizeStatus(value) {
  const cleaned = value.trim().toLowerCase();
  return ALLOWED_STATUSES.includes(cleaned) ? cleaned : null;
}

/**
 * Normalizes a lead source value against the allowed sources list.
 *
 * @param {string} value - Raw lead source string.
 * @returns {string|null} Matched source or null if no match.
 */
function normalizeLeadSource(value) {
  const cleaned = value.trim().toLowerCase();
  return ALLOWED_SOURCES.includes(cleaned) ? cleaned : null;
}

/** @type {Record<string, (value: string) => string|null>} */
const FIELD_NORMALIZERS = {
  email: normalizeEmail,
  phone: normalizePhone,
  website: normalizeWebsite,
  linkedin: normalizeLinkedin,
  status: normalizeStatus,
  lead_source: normalizeLeadSource,
};

/**
 * Normalizes a value based on its target CRM field type.
 *
 * Applies field-specific cleaning and validation rules. For fields without
 * a specialized normalizer, performs basic whitespace trimming.
 *
 * @param {string} fieldName - Target CRM field name (e.g. 'email', 'phone').
 * @param {string} value - Raw value to normalize.
 * @returns {string|null} Normalized value, or null if the value is invalid
 *   for the given field type.
 *
 * @example
 * normalizeMappingValue('email', '  Alice@Example.COM  '); // => 'alice@example.com'
 * normalizeMappingValue('phone', '+1 (555) 123-4567');     // => '+15551234567'
 * normalizeMappingValue('website', 'example.com');          // => 'https://example.com'
 * normalizeMappingValue('email', 'not-an-email');           // => null
 */
function normalizeMappingValue(fieldName, value) {
  if (typeof value !== 'string') return null;

  const normalizer = FIELD_NORMALIZERS[fieldName];
  if (normalizer) {
    return normalizer(value);
  }

  return value.trim();
}

/**
 * Normalizes a CSV header string for fuzzy comparison.
 *
 * Lowercases the string, trims whitespace, and removes special characters
 * (hyphens, underscores, dots, spaces) to enable loose matching.
 *
 * @param {string} header - Raw CSV header string.
 * @returns {string} Normalized header suitable for comparison.
 *
 * @example
 * normalizeHeaderForComparison('First Name');   // => 'firstname'
 * normalizeHeaderForComparison('e-mail_addr.'); // => 'emailaddr'
 * normalizeHeaderForComparison('  PHONE  ');    // => 'phone'
 */
function normalizeHeaderForComparison(header) {
  if (typeof header !== 'string') return '';
  return header.trim().toLowerCase().replace(HEADER_STRIP_PATTERN, '');
}

module.exports = {
  normalizeMappingValue,
  normalizeHeaderForComparison,
};
