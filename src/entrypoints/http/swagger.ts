import type { FastifyInstance } from 'fastify';

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(server: FastifyInstance): Promise<void> {
    await server.register(swagger, {
        openapi: {
            openapi: '3.0.3',

            info: {
                title: 'CostFlow API',
                description:
                    'Cost management and invoice processing API',
                version: '1.0.0',
            },

            tags: [
                {
                    name: 'System',
                    description: 'System management',
                },
                {
                    name: 'Organizations',
                    description: 'Organization management',
                },
            ],
        },
    });

    await server.register(swaggerUi, {
        routePrefix: '/docs',
    });
}