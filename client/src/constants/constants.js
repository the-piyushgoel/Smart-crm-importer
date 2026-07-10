/** Shared constants for the frontend application */

export const WIZARD_STEPS = {
  UPLOAD: 0,
  PREVIEW: 1,
  MAPPING: 2,
  REVIEW: 3,
  EXECUTE: 4,
  SUMMARY: 5,
};

export const WIZARD_STEP_LABELS = [
  'Upload',
  'Preview',
  'AI Mapping',
  'Review',
  'Importing',
  'Done'
];

export const MESSAGES = {
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  MAPPING_FAILED: 'AI mapping failed. Please retry.',
  IMPORT_FAILED: 'Import execution failed.',
  FILE_TOO_LARGE: (maxMB) => `File exceeds ${maxMB}MB limit.`,
  INVALID_FILE_TYPE: 'Only .csv files are supported.',
  DUPLICATE_MAPPING: 'Please resolve duplicate mappings before proceeding.',
};
