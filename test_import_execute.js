/**
 * Phase 4 — Import Execution Engine verification script.
 * Tests multiple edge cases against POST /api/v1/import/execute.
 */

const http = require('http');

function makeRequest(label, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/import/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (d) => (responseBody += d));
      res.on('end', () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`TEST: ${label}`);
        console.log(`STATUS: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(responseBody);
          console.log('RESPONSE:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('RAW RESPONSE:', responseBody);
        }
        console.log('='.repeat(60));
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`TEST FAILED: ${label}`, err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  // Test 1: Normal dataset
  await makeRequest('Normal Dataset', {
    mapping: [
      { uploaded_field: 'Mail ID', mapped_field: 'email' },
      { uploaded_field: 'Mobile No', mapped_field: 'phone' },
      { uploaded_field: 'Client Name', mapped_field: 'first_name' },
    ],
    headers: ['Mail ID', 'Mobile No', 'Client Name'],
    rows: [
      ['abc@gmail.com', '9876543210', 'Piyush'],
      ['xyz@gmail.com', '9123456789', 'Rahul'],
    ],
  });

  // Test 2: Missing email (phone present — should pass)
  await makeRequest('Missing Email (has phone)', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Phone', mapped_field: 'phone' },
    ],
    headers: ['Email', 'Phone'],
    rows: [['', '9876543210']],
  });

  // Test 3: Missing phone (email present — should pass)
  await makeRequest('Missing Phone (has email)', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Phone', mapped_field: 'phone' },
    ],
    headers: ['Email', 'Phone'],
    rows: [['test@example.com', '']],
  });

  // Test 4: Missing both email AND phone — should be SKIPPED
  await makeRequest('Missing Both Email and Phone (Rule 7)', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Phone', mapped_field: 'phone' },
      { uploaded_field: 'Name', mapped_field: 'first_name' },
    ],
    headers: ['Email', 'Phone', 'Name'],
    rows: [['', '', 'Orphan User']],
  });

  // Test 5: Invalid email
  await makeRequest('Invalid Email', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Phone', mapped_field: 'phone' },
    ],
    headers: ['Email', 'Phone'],
    rows: [['not-an-email', '9876543210']],
  });

  // Test 6: Unknown CRM field in mapping
  await makeRequest('Unknown CRM Field in Mapping', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Fax', mapped_field: 'fax_number' },
    ],
    headers: ['Email', 'Fax'],
    rows: [['test@example.com', '555-1234']],
  });

  // Test 7: Mixed dataset (some valid, some skipped)
  await makeRequest('Mixed Dataset', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Phone', mapped_field: 'phone' },
      { uploaded_field: 'Name', mapped_field: 'first_name' },
      { uploaded_field: 'Company', mapped_field: 'company' },
    ],
    headers: ['Email', 'Phone', 'Name', 'Company'],
    rows: [
      ['alice@test.com', '1234567890', 'Alice', 'Acme Inc'],
      ['', '', 'Bob', 'Beta Corp'],
      ['charlie@test.com', '', 'Charlie', 'Gamma LLC'],
      ['', '5551234567', 'Dave', 'Delta Co'],
      ['', '', '', ''],
    ],
  });

  // Test 8: Empty body — should return validation error
  await makeRequest('Empty Body Validation', {});

  // Test 9: Website normalization
  await makeRequest('Website Normalization', {
    mapping: [
      { uploaded_field: 'Email', mapped_field: 'email' },
      { uploaded_field: 'Site', mapped_field: 'website' },
    ],
    headers: ['Email', 'Site'],
    rows: [['user@test.com', 'example.com']],
  });

  console.log('\n\nAll tests completed.');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
