const API_BASE = '/api/v1';

/**
 * Uploads a CSV file and returns preview data.
 * @param {File} file
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function uploadPreview(file, signal) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/import/preview`, {
    method: 'POST',
    body: formData,
    signal,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return json;
}

/**
 * Requests AI mapping for headers and preview rows.
 * @param {string[]} headers
 * @param {Array<string[]>} previewRows
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function requestMapping(headers, previewRows, signal) {
  const res = await fetch(`${API_BASE}/import/mapping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headers, preview_rows: previewRows }),
    signal,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Mapping failed');
  return json;
}

/**
 * Executes import with confirmed mappings and row data.
 * @param {Array} mapping
 * @param {string[]} headers
 * @param {Array<string[]>} rows
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function executeImport(mapping, headers, rows, signal) {
  const res = await fetch(`${API_BASE}/import/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapping, headers, rows }),
    signal,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Import failed');
  return json;
}
