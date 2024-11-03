import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { schema } from './schema.js';
import depthLimit from 'graphql-depth-limit';

const DEPTH_LIMIT_VALUE = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      try {
        const { query, variables } = req.body;

        const parsedQuery = parse(query)

        const validationErrors = validate(schema, parsedQuery, [depthLimit(DEPTH_LIMIT_VALUE)])

        if (validationErrors.length > 0) {
          return {
            errors: validationErrors.map((err) => ({
              message: err.message
            }))
          }
        }
        
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma
          }
        })

        if (result.errors) {
          return { errors: result.errors }
        }
  
        return result;
      } catch {
        return {
          errors: [{ message: 'Internal server error' }]
        }
      }
    },
  });
};

export default plugin;
