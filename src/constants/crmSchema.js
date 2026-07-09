/**
 * @module constants/crmSchema
 * @description GrowEasy CRM target schema definitions.
 *
 * Defines every target field the AI mapping engine can map to,
 * along with allowed enum values for constrained fields.
 * This is injected into AI prompts and used for validation.
 */

'use strict';

/**
 * Allowed values for the status field.
 * @type {readonly string[]}
 */
const ALLOWED_STATUSES = Object.freeze([
  'new',
  'contacted',
  'qualified',
  'lost',
  'won',
]);

/**
 * Allowed values for the lead_source field.
 * @type {readonly string[]}
 */
const ALLOWED_SOURCES = Object.freeze([
  'website',
  'referral',
  'social_media',
  'advertisement',
  'cold_call',
  'event',
  'other',
]);

/**
 * GrowEasy CRM target schema definition.
 * Each field specifies its name, data type, whether it is required, and a
 * human-readable description used for AI prompt context.
 */
const CRM_SCHEMA = Object.freeze({
  fields: Object.freeze([
    Object.freeze({ name: 'first_name', type: 'string', required: false, description: 'First name of the contact' }),
    Object.freeze({ name: 'last_name', type: 'string', required: false, description: 'Last name or surname of the contact' }),
    Object.freeze({ name: 'email', type: 'string', required: false, description: 'Primary email address of the contact' }),
    Object.freeze({ name: 'phone', type: 'string', required: false, description: 'Phone or mobile number of the contact' }),
    Object.freeze({ name: 'company', type: 'string', required: false, description: 'Company or organization name' }),
    Object.freeze({ name: 'job_title', type: 'string', required: false, description: 'Job title or designation' }),
    Object.freeze({ name: 'city', type: 'string', required: false, description: 'City of the contact' }),
    Object.freeze({ name: 'state', type: 'string', required: false, description: 'State or province of the contact' }),
    Object.freeze({ name: 'country', type: 'string', required: false, description: 'Country of the contact' }),
    Object.freeze({ name: 'website', type: 'string', required: false, description: 'Website URL of the contact or company' }),
    Object.freeze({ name: 'linkedin', type: 'string', required: false, description: 'LinkedIn profile URL' }),
    Object.freeze({ name: 'industry', type: 'string', required: false, description: 'Industry or sector of the company' }),
    Object.freeze({ name: 'status', type: 'enum', required: false, description: `Lead status. Allowed: ${ALLOWED_STATUSES.join(', ')}` }),
    Object.freeze({ name: 'lead_source', type: 'enum', required: false, description: `Origin of the lead. Allowed: ${ALLOWED_SOURCES.join(', ')}` }),
    Object.freeze({ name: 'notes', type: 'text', required: false, description: 'Free-text notes. Fallback field for unmapped or low-confidence columns' }),
  ]),
});

/**
 * Ordered array of all CRM field name strings.
 * @type {readonly string[]}
 */
const CRM_FIELD_NAMES = Object.freeze(
  CRM_SCHEMA.fields.map((field) => field.name)
);

module.exports = {
  CRM_SCHEMA,
  CRM_FIELD_NAMES,
  ALLOWED_STATUSES,
  ALLOWED_SOURCES,
};
