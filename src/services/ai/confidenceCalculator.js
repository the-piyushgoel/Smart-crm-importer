/**
 * @module services/ai/confidenceCalculator
 * @description Confidence normalization, classification, and low-confidence
 * fallback rules for AI-generated CRM field mappings.
 *
 * Handles both 0-1 float scores (from some AI providers) and 0-100 integer
 * scores, normalizing everything to a consistent 0-100 integer range.
 */

'use strict';

/** Threshold at or above which confidence is classified as 'high'. */
const HIGH_CONFIDENCE_THRESHOLD = 90;

/** Threshold at or above which confidence is classified as 'medium'. */
const MEDIUM_CONFIDENCE_THRESHOLD = 60;

/** Fallback CRM field for low-confidence mappings. */
const LOW_CONFIDENCE_FALLBACK_FIELD = 'notes';

/**
 * Normalizes a raw AI confidence score to an integer in the 0-100 range.
 *
 * If the raw score is a float between 0 and 1 (exclusive of 1), it is
 * treated as a proportion and multiplied by 100. Otherwise it is rounded
 * and clamped to the 0-100 range.
 *
 * @param {number} rawScore - Raw confidence score from AI (0-1 float or 0-100 integer).
 * @returns {number} Integer confidence score clamped to 0-100.
 *
 * @example
 * normalizeConfidence(0.85);  // => 85
 * normalizeConfidence(92);    // => 92
 * normalizeConfidence(150);   // => 100
 * normalizeConfidence(-5);    // => 0
 */
function normalizeConfidence(rawScore) {
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) {
    return 0;
  }

  let score = rawScore;

  // Treat values in (0, 1) exclusive range as 0-1 float scale
  if (score > 0 && score < 1) {
    score = score * 100;
  }

  score = Math.round(score);
  return Math.max(0, Math.min(100, score));
}

/**
 * Classifies a normalized confidence score into a tier.
 *
 * @param {number} score - Normalized confidence score (0-100 integer).
 * @returns {'high' | 'medium' | 'low'} Confidence tier label.
 *
 * @example
 * classifyConfidence(95);  // => 'high'
 * classifyConfidence(75);  // => 'medium'
 * classifyConfidence(40);  // => 'low'
 */
function classifyConfidence(score) {
  if (score >= HIGH_CONFIDENCE_THRESHOLD) {
    return 'high';
  }
  if (score >= MEDIUM_CONFIDENCE_THRESHOLD) {
    return 'medium';
  }
  return 'low';
}

/**
 * Applies the low-confidence fallback rule to a mapping object.
 *
 * If the mapping's confidence is below the medium threshold, the mapped field
 * is overridden to the fallback field ('notes') and a `manual_review` flag
 * is added to signal that a human should verify the mapping.
 *
 * The original mapping object is mutated and returned for convenience.
 *
 * @param {{ confidence: number, mapped_field: string, manual_review?: boolean }} mapping -
 *   A single field mapping object from the AI response.
 * @returns {{ confidence: number, mapped_field: string, manual_review?: boolean }}
 *   The mapping object, potentially modified with fallback field and review flag.
 *
 * @example
 * const mapping = { uploaded_field: 'Fax', mapped_field: 'phone', confidence: 35, reason: 'Weak match' };
 * applyLowConfidenceRule(mapping);
 * // => { uploaded_field: 'Fax', mapped_field: 'notes', confidence: 35, reason: 'Weak match', manual_review: true }
 */
function applyLowConfidenceRule(mapping) {
  if (mapping.confidence < MEDIUM_CONFIDENCE_THRESHOLD) {
    mapping.mapped_field = LOW_CONFIDENCE_FALLBACK_FIELD;
    mapping.manual_review = true;
  }
  return mapping;
}

module.exports = {
  normalizeConfidence,
  classifyConfidence,
  applyLowConfidenceRule,
};
