import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './schema.js'

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
        
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma
          }
        })

        if (result.errors) {
          return { errors: result.errors, prisma }
        }
  
        return result;
      } catch (error) {
        return { errors: [{ message: 'Internal server error' }], prisma }
      }
    },
  });
};

export default plugin;
