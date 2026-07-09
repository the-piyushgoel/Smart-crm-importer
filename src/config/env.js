require('dotenv/config');
const Joi = require('joi');

const envSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  AI_PROVIDER: Joi.string()
    .valid('claude', 'gemini', 'openai')
    .default('claude'),
  ANTHROPIC_API_KEY: Joi.string().when('AI_PROVIDER', {
    is: 'claude',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  OPENAI_API_KEY: Joi.string().when('AI_PROVIDER', {
    is: 'openai',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  GEMINI_API_KEY: Joi.string().when('AI_PROVIDER', {
    is: 'gemini',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})
  .unknown(true)
  .required();

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const details = error.details.map((d) => d.message).join('\n  - ');
  /* eslint-disable no-console */
  console.error(`Environment validation failed:\n  - ${details}`);
  /* eslint-enable no-console */
  process.exit(1);
}

/**
 * Validated and frozen application environment configuration.
 * @type {Readonly<{
 *   PORT: number,
 *   NODE_ENV: string,
 *   CORS_ORIGIN: string,
 *   AI_PROVIDER: string,
 *   ANTHROPIC_API_KEY: string | undefined,
 *   OPENAI_API_KEY: string | undefined,
 *   GEMINI_API_KEY: string | undefined,
 * }>}
 */
const config = Object.freeze({
  PORT: value.PORT,
  NODE_ENV: value.NODE_ENV,
  CORS_ORIGIN: value.CORS_ORIGIN,
  AI_PROVIDER: value.AI_PROVIDER,
  ANTHROPIC_API_KEY: value.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: value.OPENAI_API_KEY,
  GEMINI_API_KEY: value.GEMINI_API_KEY,
});

module.exports = config;
