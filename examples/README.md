# Example Datasets

This directory contains various CSV files for testing the GrowEasy AI CSV Importer.

## Valid Datasets

- `employees.csv`: A standard dataset containing employee contact information. Perfect for testing standard AI mappings.
- `customers.csv`: A customer dataset containing industry and revenue fields to test CRM schema limits.
- `test.csv`: A simple generic dataset.
- `large.csv`: A 1,000-row dataset to test frontend chunking and backend stream limits.

## Edge Case Datasets

- `semicolon.csv`: Uses a semicolon (`;`) delimiter instead of a comma. Tests the auto-delimiter detection.
- `duplicate_headers.csv`: Contains two headers with the same name. Tests the duplicate mapping validation in the review step.
- `malformed.csv`: Contains misaligned rows and missing columns to test parsing robustness.
- `empty.csv`: An empty file to test early validation.
