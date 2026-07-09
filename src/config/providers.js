/**
 * AI provider model configurations and batch-processing parameters.
 * @type {Readonly<{
 *   CLAUDE: Readonly<{ model: string, maxTokens: number, temperature: number, topP: number }>,
 *   GEMINI: Readonly<{ model: string, maxTokens: number, temperature: number, topP: number }>,
 *   OPENAI: Readonly<{ model: string, maxTokens: number, temperature: number, topP: number }>,
 *   BATCH: Readonly<{
 *     maxRowsPerBatch: number,
 *     maxRetries: number,
 *     baseRetryDelayMs: number,
 *     maxParallelBatches: number,
 *     requestTimeoutMs: number,
 *   }>,
 * }>}
 */
const PROVIDERS = Object.freeze({
  CLAUDE: Object.freeze({
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0,
    topP: 0.1,
  }),

  GEMINI: Object.freeze({
    model: 'gemini-2.5-flash',
    maxTokens: 4096,
    temperature: 0,
    topP: 0.1,
  }),

  OPENAI: Object.freeze({
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0,
    topP: 0.1,
  }),

  BATCH: Object.freeze({
    /** Maximum CSV rows sent in a single AI request */
    maxRowsPerBatch: 70,
    /** Number of retry attempts on transient failures */
    maxRetries: 3,
    /** Initial delay before first retry (exponential backoff base) */
    baseRetryDelayMs: 1000,
    /** Maximum concurrent AI requests */
    maxParallelBatches: 3,
    /** Per-request timeout in milliseconds */
    requestTimeoutMs: 30000,
  }),
});

module.exports = PROVIDERS;
