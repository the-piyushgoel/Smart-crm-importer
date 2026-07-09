/**
 * @module services/ai/mappingService
 * @description AI Mapping Engine orchestrator.
 *
 * Coordinates the full mapping workflow:
 * 1. Run deterministic header heuristics (skip AI if confidence > 95).
 * 2. For remaining headers, build an AI prompt and call the active provider.
 * 3. Validate and parse AI response.
 * 4. Normalize confidence scores and apply low-confidence fallback rules.
 * 5. Return unified mapping array with explainability.
 */

'use strict';

const logger = require('../../utils/logger');
const { matchHeaderHeuristically } = require('./headerHeuristics');
const { buildMappingPrompt } = require('./promptBuilder');
const { getProvider } = require('./providerFactory');
const { normalizeConfidence, classifyConfidence, applyLowConfidenceRule } = require('./confidenceCalculator');
const { CRM_FIELD_NAMES } = require('../../constants/crmSchema');
const { AIResponseError } = require('../../errors');
const PROVIDERS = require('../../config/providers');

/**
 * Parses and validates the raw AI response string into a mappings array.
 *
 * @param {string} raw - Raw text response from the AI provider.
 * @returns {Array<object>} Parsed mappings array.
 * @throws {AIResponseError} If the response is not valid JSON or is malformed.
 */
function parseAIResponse(raw) {
  // Strip markdown code block wrappers if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new AIResponseError('AI returned invalid JSON.', { raw: cleaned.substring(0, 500) });
  }

  // Handle both { mappings: [...] } and direct array formats
  const mappings = Array.isArray(parsed) ? parsed : parsed.mappings;

  if (!Array.isArray(mappings)) {
    throw new AIResponseError('AI response missing "mappings" array.', { keys: Object.keys(parsed) });
  }

  // Validate each mapping entry
  for (const m of mappings) {
    if (!m.uploaded_field || !m.mapped_field) {
      throw new AIResponseError('AI mapping entry missing required fields.', { entry: m });
    }

    if (typeof m.confidence !== 'number') {
      throw new AIResponseError('AI mapping entry has non-numeric confidence.', { entry: m });
    }

    if (!CRM_FIELD_NAMES.includes(m.mapped_field)) {
      logger.warn('AI returned unknown CRM field, remapping to notes', {
        uploaded_field: m.uploaded_field,
        invalid_field: m.mapped_field,
      });
      m.mapped_field = 'notes';
      m.reason = (m.reason || '') + ' [Remapped: unknown CRM field]';
    }
  }

  return mappings;
}

/**
 * Generates column mappings for uploaded CSV headers.
 *
 * @param {string[]} headers - Array of uploaded CSV column headers.
 * @param {Array<string[]>} previewRows - Sample data rows for value analysis.
 * @param {string} requestId - Correlation ID for structured logging.
 * @returns {Promise<object>} Mapping result with mappings array and metadata.
 */
async function generateMappings(headers, previewRows, requestId) {
  const startTime = Date.now();
  const childLogger = logger.child({ request_id: requestId });

  childLogger.info('Mapping started', { header_count: headers.length });

  const finalMappings = [];
  const headersNeedingAI = [];
  const headersIndexMap = {};

  // --- Phase 1: Deterministic heuristics ---
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];

    // Extract sample values for this column from preview rows
    const sampleValues = previewRows
      .map((row) => (row[i] !== undefined ? String(row[i]) : ''))
      .filter((v) => v !== '');

    const heuristicResult = matchHeaderHeuristically(header, sampleValues);

    if (heuristicResult && heuristicResult.confidence > 95) {
      childLogger.info('Heuristic hit', {
        header,
        mapped_field: heuristicResult.mapped_field,
        confidence: heuristicResult.confidence,
      });

      finalMappings.push({
        uploaded_field: header,
        mapped_field: heuristicResult.mapped_field,
        confidence: heuristicResult.confidence,
        confidence_level: classifyConfidence(heuristicResult.confidence),
        reason: heuristicResult.reason,
        source: 'heuristic',
      });
    } else {
      headersNeedingAI.push(header);
      headersIndexMap[header] = i;
    }
  }

  childLogger.info('Heuristic phase completed', {
    heuristic_mapped: finalMappings.length,
    ai_needed: headersNeedingAI.length,
  });

  // --- Phase 2: AI mapping for remaining headers ---
  if (headersNeedingAI.length > 0) {
    const provider = getProvider();
    const { systemPrompt, userPrompt } = buildMappingPrompt(headersNeedingAI, previewRows);

    let aiMappings = null;
    let attempts = 0;
    const maxRetries = PROVIDERS.BATCH.maxRetries;

    while (attempts <= 1) {
      attempts++;
      childLogger.info('AI request', { attempt: attempts, provider: provider.constructor.name });

      try {
        const rawResponse = await provider.executeMapping(systemPrompt, userPrompt);
        childLogger.info('AI response received', { response_length: rawResponse.length });

        aiMappings = parseAIResponse(rawResponse);
        childLogger.info('AI response validated', { mapping_count: aiMappings.length });
        break;
      } catch (err) {
        childLogger.warn('AI attempt failed', {
          attempt: attempts,
          error: err.message,
        });

        if (attempts > 1) {
          throw new AIResponseError(
            `AI mapping failed after ${attempts} attempts: ${err.message}`,
            { lastError: err.message }
          );
        }

        childLogger.info('Retrying AI request');
      }
    }

    // Merge AI mappings into final results
    if (aiMappings) {
      for (const m of aiMappings) {
        const normalized = normalizeConfidence(m.confidence);
        const level = classifyConfidence(normalized);

        let mapping = {
          uploaded_field: m.uploaded_field,
          mapped_field: m.mapped_field,
          confidence: normalized,
          confidence_level: level,
          reason: m.reason || 'Matched by AI semantic analysis.',
          source: 'ai',
        };

        mapping = applyLowConfidenceRule(mapping);
        finalMappings.push(mapping);
      }
    }
  }

  // --- Deduplication: if two headers map to same CRM field, demote the lower one ---
  const fieldOccurrences = {};
  for (const m of finalMappings) {
    if (m.mapped_field === 'notes') continue;
    if (!fieldOccurrences[m.mapped_field]) {
      fieldOccurrences[m.mapped_field] = [];
    }
    fieldOccurrences[m.mapped_field].push(m);
  }

  for (const [field, entries] of Object.entries(fieldOccurrences)) {
    if (entries.length > 1) {
      entries.sort((a, b) => b.confidence - a.confidence);
      for (let i = 1; i < entries.length; i++) {
        childLogger.warn('Duplicate mapping detected, demoting to notes', {
          field,
          demoted_header: entries[i].uploaded_field,
        });
        entries[i].mapped_field = 'notes';
        entries[i].reason += ' [Demoted: duplicate mapping conflict]';
        entries[i].manual_review = true;
      }
    }
  }

  const durationMs = Date.now() - startTime;
  childLogger.info('Mapping completed', {
    total_mappings: finalMappings.length,
    heuristic_count: finalMappings.filter((m) => m.source === 'heuristic').length,
    ai_count: finalMappings.filter((m) => m.source === 'ai').length,
    duration_ms: durationMs,
  });

  return {
    mappings: finalMappings,
    metadata: {
      total_headers: headers.length,
      heuristic_mapped: finalMappings.filter((m) => m.source === 'heuristic').length,
      ai_mapped: finalMappings.filter((m) => m.source === 'ai').length,
      processing_time_ms: durationMs,
    },
  };
}

module.exports = { generateMappings };
