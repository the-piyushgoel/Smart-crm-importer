/**
 * Allowed values for the crm_status field.
 * @type {readonly string[]}
 */
const ALLOWED_STATUSES = Object.freeze([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

/**
 * Allowed values for the data_source field.
 * @type {readonly string[]}
 */
const ALLOWED_SOURCES = Object.freeze([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

/**
 * GrowEasy CRM target schema definition.
 * Each field specifies its name, data type, whether it is required, and a
 * human-readable description used for AI prompt context.
 *
 * @type {Readonly<{
 *   fields: readonly Readonly<{
 *     name: string,
 *     type: string,
 *     required: boolean,
 *     description: string,
 *   }>[],
 * }>}
 */
const CRM_SCHEMA = Object.freeze({
  fields: Object.freeze([
    Object.freeze({
      name: 'created_at',
      type: 'datetime',
      required: false,
      description: 'Timestamp when the lead was created',
    }),
    Object.freeze({
      name: 'name',
      type: 'string',
      required: false,
      description: 'Full name of the lead contact',
    }),
    Object.freeze({
      name: 'email',
      type: 'string',
      required: false,
      description:
        'Email address of the lead (conditionally required: at least email or mobile must be present)',
    }),
    Object.freeze({
      name: 'country_code',
      type: 'string',
      required: false,
      description: 'Phone country code (e.g. +91, +1)',
    }),
    Object.freeze({
      name: 'mobile_without_country_code',
      type: 'string',
      required: false,
      description:
        'Mobile number without country code (conditionally required: at least email or mobile must be present)',
    }),
    Object.freeze({
      name: 'company',
      type: 'string',
      required: false,
      description: 'Company or organization name',
    }),
    Object.freeze({
      name: 'city',
      type: 'string',
      required: false,
      description: 'City of the lead',
    }),
    Object.freeze({
      name: 'state',
      type: 'string',
      required: false,
      description: 'State or province of the lead',
    }),
    Object.freeze({
      name: 'country',
      type: 'string',
      required: false,
      description: 'Country of the lead',
    }),
    Object.freeze({
      name: 'lead_owner',
      type: 'string',
      required: false,
      description: 'Name or identifier of the assigned lead owner',
    }),
    Object.freeze({
      name: 'crm_status',
      type: 'enum',
      required: false,
      description: `Lead status in the CRM. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
    }),
    Object.freeze({
      name: 'crm_note',
      type: 'text',
      required: false,
      description: 'Free-text note attached to the lead',
    }),
    Object.freeze({
      name: 'data_source',
      type: 'enum',
      required: false,
      description: `Origin source of the lead data. Allowed values: ${ALLOWED_SOURCES.join(', ')}`,
    }),
    Object.freeze({
      name: 'possession_time',
      type: 'datetime',
      required: false,
      description: 'Expected possession or handover date',
    }),
    Object.freeze({
      name: 'description',
      type: 'text',
      required: false,
      description: 'Additional details or context about the lead',
    }),
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
