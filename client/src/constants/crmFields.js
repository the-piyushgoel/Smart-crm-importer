/** CRM target schema fields used across the frontend. */
export const CRM_FIELDS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'industry', label: 'Industry' },
  { value: 'status', label: 'Status' },
  { value: 'lead_source', label: 'Lead Source' },
  { value: 'notes', label: 'Notes' },
];

export const CRM_FIELD_VALUES = CRM_FIELDS.map((f) => f.value);
