/**
 * @module services/ai/providers/geminiProvider
 * @description Google Gemini API provider implementation.
 */

'use strict';

const logger = require('../../../utils/logger');
const { AIProviderError } = require('../../../errors');

class GeminiProvider {
  /**
   * @param {string} apiKey - Gemini API key.
   * @param {Object} config - Provider configuration (model, maxTokens, temperature).
   */
  constructor(apiKey, config) {
    if (!apiKey) throw new Error('Gemini API key is required');
    this.apiKey = apiKey;
    this.config = config;
  }

  /**
   * Executes a mapping prompt against the Gemini API.
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>} Raw string response from the model.
   * @throws {AIProviderError} On HTTP or API errors.
   */
  async executeMapping(systemPrompt, userPrompt) {
    const startTime = Date.now();
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
            }
          ],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Unknown API Error');
      }

      const durationMs = Date.now() - startTime;
      logger.info('Gemini API request completed', { duration_ms: durationMs });

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        throw new Error('Malformed response structure from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error('Gemini API request failed', { duration_ms: durationMs, error: err.message });
      throw new AIProviderError(`Gemini Provider Error: ${err.message}`);
    }
  }
}

module.exports = GeminiProvider;
