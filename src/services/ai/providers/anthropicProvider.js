/**
 * @module services/ai/providers/anthropicProvider
 * @description Anthropic Claude API provider implementation.
 */

'use strict';

const logger = require('../../../utils/logger');
const { AIProviderError } = require('../../../errors');

class AnthropicProvider {
  /**
   * @param {string} apiKey - Anthropic API key.
   * @param {Object} config - Provider configuration (model, maxTokens, temperature).
   */
  constructor(apiKey, config) {
    if (!apiKey) throw new Error('Anthropic API key is required');
    this.apiKey = apiKey;
    this.config = config;
  }

  /**
   * Executes a mapping prompt against the Anthropic API.
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>} Raw string response from the model.
   * @throws {AIProviderError} On HTTP or API errors.
   */
  async executeMapping(systemPrompt, userPrompt) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Unknown API Error');
      }

      const durationMs = Date.now() - startTime;
      logger.info('Anthropic API request completed', { duration_ms: durationMs });

      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Malformed response structure from Anthropic API');
      }

      return data.content[0].text;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error('Anthropic API request failed', { duration_ms: durationMs, error: err.message });
      throw new AIProviderError(`Anthropic Provider Error: ${err.message}`);
    }
  }
}

module.exports = AnthropicProvider;
