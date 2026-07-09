/**
 * @module services/ai/headerHeuristics
 * @description Deterministic header-to-CRM-field matching engine.
 *
 * Runs BEFORE calling AI to save tokens and latency. Resolves common synonyms,
 * abbreviations, and standard formats to target CRM fields. If heuristic
 * confidence is high, the column skips the LLM phase entirely.
 */

'use strict';

const { CRM_FIELD_NAMES } = require('../../constants/crmSchema');
const { normalizeHeaderForComparison } = require('./schemaNormalizer');

/**
 * Dictionary mapping standard CRM fields to common aliases/synonyms.
 * Keys are target CRM_FIELD_NAMES. Values are arrays of lowercase,
 * normalized synonym strings expected in raw CSV headers.
 */
const SYNONYM_MAP = {
  first_name: ['fname', 'first', 'firstname', 'first name', 'given name', 'givenname', 'prenom'],
  last_name: ['lname', 'last', 'lastname', 'last name', 'surname', 'family name', 'familyname', 'nom'],
  email: ['mail', 'email id', 'emailid', 'e-mail', 'email address', 'emailaddress', 'correo', 'mail id', 'mailid'],
  phone: ['mobile', 'mobile no', 'mobileno', 'cell', 'phone number', 'phonenumber', 'telephone', 'tel', 'contact number', 'contactnumber', 'fone', 'ph', 'telefono'],
  company: ['organization', 'org', 'firm', 'employer', 'company name', 'companyname', 'co', 'compania', 'organisation'],
  job_title: ['title', 'designation', 'position', 'role', 'job', 'jobtitle'],
  city: ['town', 'location'],
  state: ['province', 'region'],
  country: ['nation'],
  website: ['url', 'site', 'web', 'homepage', 'webpage'],
  linkedin: ['linkedin url', 'linkedinurl', 'linkedin profile', 'linkedinprofile', 'li'],
  industry: ['sector', 'vertical', 'domain'],
  status: ['lead status', 'leadstatus', 'crm status', 'crmstatus', 'stage'],
  lead_source: ['source', 'lead source', 'leadsource', 'origin', 'channel', 'data source', 'datasource'],
  notes: ['note', 'comment', 'comments', 'remark', 'remarks', 'description', 'desc', 'info', 'additional'],
};

/**
 * Attempts to deterministically match a CSV header to a CRM field using
 * exact matches, synonym dictionaries, and sample value pattern analysis.
 *
 * @param {string} header - The original CSV column header.
 * @param {string[]} sampleValues - Up to N sample values from the column.
 * @returns {{ mapped_field: string, confidence: number, reason: string } | null}
 *   A mapping object if a heuristic hit occurs; otherwise null (to fallback to AI).
 */
function matchHeaderHeuristically(header, sampleValues) {
  const normHeader = normalizeHeaderForComparison(header);
  
  // 1. Exact match against target schema fields
  if (CRM_FIELD_NAMES.includes(normHeader)) {
    return {
      mapped_field: normHeader,
      confidence: 100,
      reason: 'Exact match with CRM field.',
    };
  }

  // 2. Synonym dictionary check
  for (const [targetField, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.includes(normHeader)) {
      return {
        mapped_field: targetField,
        confidence: 97,
        reason: 'Matched using synonym dictionary.',
      };
    }
  }

  // 3. Sample values pattern analysis (data-driven heuristic fallback)
  if (sampleValues && sampleValues.length > 0) {
    let emailCount = 0;
    let phoneCount = 0;
    let linkedInCount = 0;
    let urlCount = 0;

    for (const val of sampleValues) {
      const v = val.trim().toLowerCase();
      
      if (v.includes('@') && v.includes('.')) emailCount++;
      // Check for 7-15 digit string (allowing optional leading +)
      if (/^\+?\d{7,15}$/.test(v.replace(/[-_.\s()]/g, ''))) phoneCount++;
      if (v.includes('linkedin.com/')) linkedInCount++;
      if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('www.')) urlCount++;
    }

    const threshold = Math.ceil(sampleValues.length * 0.5); // Majority match

    if (emailCount >= threshold) {
      return { mapped_field: 'email', confidence: 96, reason: 'Detected email pattern in sample values.' };
    }
    
    if (phoneCount >= threshold) {
      return { mapped_field: 'phone', confidence: 96, reason: 'Detected phone number pattern in sample values.' };
    }

    if (linkedInCount >= threshold) {
      return { mapped_field: 'linkedin', confidence: 96, reason: 'Detected LinkedIn URL pattern.' };
    }
    
    if (urlCount >= threshold) {
      return { mapped_field: 'website', confidence: 90, reason: 'Detected URL pattern in sample values.' };
    }
  }

  // No high-confidence heuristic match found
  return null;
}

module.exports = { matchHeaderHeuristically };
