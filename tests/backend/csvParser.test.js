'use strict';

const fs = require('fs');
const path = require('path');
const { processCsvPreview } = require('../../src/services/csv/csvService');
const { CSVParseError } = require('../../src/errors');
const limits = require('../../src/config/limits');

describe('CSV Parser Service', () => {
  it('should reject an empty buffer', async () => {
    await expect(processCsvPreview(Buffer.from(''), 'empty.csv')).rejects.toThrow(CSVParseError);
  });

  it('should parse a standard comma-separated CSV with headers', async () => {
    const csvContent = 'name,email\nAlice,alice@example.com\nBob,bob@example.com';
    const buffer = Buffer.from(csvContent);
    const result = await processCsvPreview(buffer, 'test.csv');

    expect(result.file_name).toBe('test.csv');
    expect(result.headers).toEqual(['name', 'email']);
    expect(result.layout.rows_count).toBe(2);
    expect(result.layout.columns_count).toBe(2);
    expect(result.preview_rows.length).toBe(2);
    expect(result.preview_rows[0]).toEqual(['Alice', 'alice@example.com']);
  });

  it('should detect semicolon delimiters automatically', async () => {
    const csvContent = 'name;email\nAlice;alice@example.com';
    const buffer = Buffer.from(csvContent);
    const result = await processCsvPreview(buffer, 'semicolon.csv');

    expect(result.layout.delimiter).toBe(';');
    expect(result.headers).toEqual(['name', 'email']);
  });

  it('should throw an error if maximum row limit is exceeded', async () => {
    // Generate 50001 rows
    const rows = Array.from({ length: 50001 }, (_, i) => `${i}`).join('\n');
    const csvContent = 'name\n' + rows;
    const buffer = Buffer.from(csvContent);

    await expect(processCsvPreview(buffer, 'large.csv')).rejects.toThrow(CSVParseError);
  });

  it('should capture malformed rows in warnings without failing completely', async () => {
    const csvContent = 'name,email\nAlice,alice@example.com\nBob\nCharlie,charlie@example.com,extra';
    const buffer = Buffer.from(csvContent);
    const result = await processCsvPreview(buffer, 'malformed.csv');

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.layout.rows_count).toBe(3);
    // Tracked max columns
    expect(result.layout.columns_count).toBe(3);
  });
});
