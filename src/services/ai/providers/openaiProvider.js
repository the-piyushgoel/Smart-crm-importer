/**
 * @module services/ai/providers/openaiProvider
 * @description OpenAI API provider implementation.
 */

'use strict';

const logger = require('../../../utils/logger');
const { AIProviderError } = require('../../../errors');

class OpenAIProvider {
  /**
   * @param {string} apiKey - OpenAI API key.
   * @param {Object} config - Provider configuration (model, maxTokens, temperature).
   */
  constructor(apiKey, config) {
    if (!apiKey) throw new Error('OpenAI API key is required');
    this.apiKey = apiKey;
    this.config = config;
  }

  /**
   * Executes a mapping prompt against the OpenAI API.
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>} Raw string response from the model.
   * @throws {AIProviderError} On HTTP or API errors.
   */
  async executeMapping(systemPrompt, userPrompt) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Unknown API Error');
      }

      const durationMs = Date.now() - startTime;
      logger.info('OpenAI API request completed', { duration_ms: durationMs });

      if (!data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
        throw new Error('Malformed response structure from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error('OpenAI API request failed', { duration_ms: durationMs, error: err.message });
      throw new AIProviderError(`OpenAI Provider Error: ${err.message}`);
    }
  }
}

module.exports = OpenAIProvider;
