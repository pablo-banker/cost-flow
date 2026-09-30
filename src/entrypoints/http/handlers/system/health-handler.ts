import type {
    FastifyReply,
    FastifyRequest,
} from 'fastify';

export const healthSchema = {
    tags: ['System'],

    summary: 'Health check',

    description:
        'Checks if the CostFlow API is running.',

    response: {
        200: {
            type: 'object',

            properties: {
                status: {
                    type: 'string',
                    enum: ['ok'],
                },
            },

            required: [
                'status',
            ],
        },
    },
} as const;

export function healthHandler() {
    return async (
        _request: FastifyRequest,
        reply: FastifyReply,
    ) => {
        return reply
            .status(200)
            .send({
                status: 'ok',
            });
    };
}