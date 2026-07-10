'use strict';

const { generateMappings } = require('../../src/services/ai/mappingService');
const providerFactory = require('../../src/services/ai/providerFactory');
const { CRM_FIELD_NAMES } = require('../../src/constants/crmSchema');

// Mock the AI Provider Factory
jest.mock('../../src/services/ai/providerFactory', () => ({
  getProvider: jest.fn()
}));

describe('AI Mapping Service', () => {
  let mockPrompt;

  beforeEach(() => {
    mockPrompt = jest.fn();
    providerFactory.getProvider.mockReturnValue({ executeMapping: mockPrompt });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should map headers deterministically based on AI response', async () => {
    const headers = ['Random Field Alpha', 'Beta Header'];
    const sampleRows = [['John', 'some-generic-text']];
    
    // Simulate a successful AI JSON response
    mockPrompt.mockResolvedValue(JSON.stringify({
      mappings: [
        {
          uploaded_field: 'Random Field Alpha',
          mapped_field: 'first_name',
          confidence: 95,
          reason: 'Matches CRM first_name field.'
        },
        {
          uploaded_field: 'Beta Header',
          mapped_field: 'email',
          confidence: 100,
          reason: 'Exact semantic match.'
        }
      ]
    }));

    const result = await generateMappings(headers, sampleRows, 'test-req-id');
    const mappings = result.mappings;
    
    expect(mappings.length).toBe(2);
    // Find the mapping for Random Field Alpha
    const alphaMapping = mappings.find(m => m.uploaded_field === 'Random Field Alpha');
    expect(alphaMapping.mapped_field).toBe('first_name');
    expect(alphaMapping.confidence_level).toBe('high');
    expect(alphaMapping.source).toBe('ai');
  });

  it('should fallback to heuristic mapping if AI throws an error', async () => {
    const headers = ['unknown_field_1', 'unknown_field_2'];
    const sampleRows = [['test', 'foo']];
    
    // Simulate AI failure
    mockPrompt.mockRejectedValue(new Error('AI Provider Timeout'));

    await expect(generateMappings(headers, sampleRows, 'test-req-id')).rejects.toThrow('AI mapping failed');
  });
});
