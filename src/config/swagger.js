/**
 * @module config/swagger
 * @description Swagger / OpenAPI configuration for the GrowEasy Import Wizard API.
 */

'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const { CRM_FIELD_NAMES } = require('../constants/crmSchema');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GrowEasy CSV Importer API',
      version: '1.0.0',
      description: 'API documentation for the AI-powered GrowEasy CRM CSV Importer.',
      contact: {
        name: 'GrowEasy Support',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Local development server v1 API',
      },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            metadata: { type: 'object' },
            warnings: { type: 'array', items: { type: 'string' } },
            errors: { type: 'array', items: { type: 'object' } },
            request_id: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
            metadata: { type: 'object' },
            warnings: { type: 'array', items: { type: 'string' } },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  detail: { type: 'object', additionalProperties: true }
                }
              }
            },
            request_id: { type: 'string' }
          }
        },
        CRMField: {
          type: 'string',
          enum: [...CRM_FIELD_NAMES, 'ignore'],
          description: 'Valid CRM schema field or "ignore"'
        }
      },
      responses: {
        BadRequest: {
          description: 'Validation Error (400)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Validation failed',
                data: null,
                metadata: {},
                warnings: [],
                errors: [{ code: 'VALIDATION_ERROR', message: 'Invalid payload' }],
                request_id: 'req-123'
              }
            }
          }
        },
        UnprocessableEntity: {
          description: 'Unprocessable Entity (422) - e.g., Invalid CSV or AI failure',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error (500)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
