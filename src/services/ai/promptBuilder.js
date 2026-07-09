/**
 * @module services/ai/promptBuilder
 * @description Constructs structured XML prompts for the GrowEasy AI mapping engine.
 *
 * Builds a system prompt establishing the AI as a deterministic CRM migration
 * engine and a user prompt containing CRM schema constraints, dataset context,
 * execution instructions, and the expected JSON output schema.
 */

'use strict';

const { CRM_SCHEMA } = require('../../constants/crmSchema');

/** Maximum number of sample rows included in prompt context. */
const MAX_SAMPLE_ROWS = 5;

/** AI temperature setting — deterministic output. */
const TEMPERATURE = 0;

/** System role identity for the AI agent. */
const SYSTEM_IDENTITY = 'GrowEasy Enterprise CRM Migration Engine';

/**
 * Builds the system prompt that establishes the AI agent role and constraints.
 *
 * @returns {string} The system prompt string.
 */
function buildSystemPrompt() {
  return [
    `You are the ${SYSTEM_IDENTITY}.`,
    'You are a deterministic field-mapping engine.',
    'Your output MUST be pure JSON — zero prose, zero markdown, zero commentary.',
    'Do NOT hallucinate field names that are not in the provided CRM schema.',
    'Do NOT invent mappings when no reasonable match exists.',
    `Temperature: ${TEMPERATURE}. Always produce the same output for the same input.`,
    'If a CSV header cannot be confidently mapped, assign it to the "notes" field with low confidence.',
  ].join(' ');
}

/**
 * Serializes CRM schema fields for prompt injection.
 *
 * @returns {string} JSON string of CRM field definitions.
 */
function serializeSchemaFields() {
  const fields = CRM_SCHEMA.fields.map((field) => ({
    name: field.name,
    type: field.type,
    description: field.description,
  }));
  return JSON.stringify(fields, null, 2);
}

/**
 * Builds the <crm_schema_constraints> XML section.
 *
 * @returns {string} XML block containing CRM schema field definitions.
 */
function buildSchemaConstraintsSection() {
  return [
    '<crm_schema_constraints>',
    'The target CRM has the following fields. You MUST only map to these field names:',
    serializeSchemaFields(),
    '</crm_schema_constraints>',
  ].join('\n');
}

/**
 * Builds the <dataset_context> XML section with headers and sample rows.
 *
 * @param {string[]} headers - CSV column headers.
 * @param {Array<Object>} sampleRows - Sample data rows (up to MAX_SAMPLE_ROWS used).
 * @returns {string} XML block containing dataset context.
 */
function buildDatasetContextSection(headers, sampleRows) {
  const limitedRows = sampleRows.slice(0, MAX_SAMPLE_ROWS);

  return [
    '<dataset_context>',
    '<csv_headers>',
    JSON.stringify(headers),
    '</csv_headers>',
    '<sample_values>',
    JSON.stringify(limitedRows, null, 2),
    '</sample_values>',
    '</dataset_context>',
  ].join('\n');
}

/**
 * Builds the <execution_instructions> XML section.
 *
 * @returns {string} XML block containing mapping instructions.
 */
function buildExecutionInstructionsSection() {
  return [
    '<execution_instructions>',
    '1. Analyze each CSV header in <csv_headers>.',
    '2. Examine the <sample_values> to understand the data in each column.',
    '3. Map each CSV header to the single closest matching CRM field from <crm_schema_constraints>.',
    '4. Assign a confidence score from 0 to 100 indicating mapping certainty.',
    '5. Provide a concise reason string explaining why the mapping was chosen.',
    '6. If no CRM field is a reasonable match, map to "notes" with low confidence.',
    '7. Do NOT map multiple CSV headers to the same CRM field unless the data clearly merges.',
    '8. Output ONLY the JSON object described in <json_output_schema>. No extra keys, no prose.',
    '</execution_instructions>',
  ].join('\n');
}

/**
 * Builds the <json_output_schema> XML section defining the expected response shape.
 *
 * @returns {string} XML block containing the output schema definition.
 */
function buildOutputSchemaSection() {
  const schema = {
    mappings: [
      {
        uploaded_field: '<original CSV header>',
        mapped_field: '<CRM field name from schema>',
        confidence: '<integer 0-100>',
        reason: '<short explanation>',
      },
    ],
  };

  return [
    '<json_output_schema>',
    'Your response MUST conform exactly to this structure:',
    JSON.stringify(schema, null, 2),
    '</json_output_schema>',
  ].join('\n');
}

/**
 * Builds the complete AI mapping prompt for CRM field mapping.
 *
 * Constructs a system prompt establishing the AI agent role and a user prompt
 * containing XML-structured sections: schema constraints, dataset context,
 * execution instructions, and the expected JSON output schema.
 *
 * @param {string[]} headers - Array of CSV column header strings.
 * @param {Array<Object>} sampleRows - Array of sample data row objects from the CSV.
 * @returns {{ systemPrompt: string, userPrompt: string }} Object containing the
 *   system role prompt and the full XML-structured user message.
 *
 * @example
 * const { systemPrompt, userPrompt } = buildMappingPrompt(
 *   ['Name', 'Email', 'Phone'],
 *   [{ Name: 'Alice', Email: 'alice@example.com', Phone: '555-0100' }]
 * );
 */
function buildMappingPrompt(headers, sampleRows) {
  const systemPrompt = buildSystemPrompt();

  const userPrompt = [
    '<system_prompt>',
    systemPrompt,
    '</system_prompt>',
    '',
    buildSchemaConstraintsSection(),
    '',
    buildDatasetContextSection(headers, sampleRows),
    '',
    buildExecutionInstructionsSection(),
    '',
    buildOutputSchemaSection(),
  ].join('\n');

  return { systemPrompt, userPrompt };
}

module.exports = { buildMappingPrompt };
