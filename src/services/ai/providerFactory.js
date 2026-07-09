/**
 * @module services/ai/providerFactory
 * @description Factory for resolving the active AI provider based on environment config.
 */

'use strict';

const env = require('../../config/env');
const PROVIDERS = require('../../config/providers');
const AnthropicProvider = require('./providers/anthropicProvider');
const OpenAIProvider = require('./providers/openaiProvider');
const GeminiProvider = require('./providers/geminiProvider');

/**
 * Returns an instance of the configured AI provider.
 *
 * @returns {AnthropicProvider | OpenAIProvider | GeminiProvider} The active AI provider instance.
 * @throws {Error} If the configured provider is unsupported or missing required API keys.
 */
function getProvider() {
  switch (env.AI_PROVIDER) {
    case 'claude':
      return new AnthropicProvider(env.ANTHROPIC_API_KEY, PROVIDERS.CLAUDE);
    case 'openai':
      return new OpenAIProvider(env.OPENAI_API_KEY, PROVIDERS.OPENAI);
    case 'gemini':
      return new GeminiProvider(env.GEMINI_API_KEY, PROVIDERS.GEMINI);
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${env.AI_PROVIDER}`);
  }
}

module.exports = { getProvider };
