export const errorSchema = {
    type: 'object',
    properties: {
        success: {
            type: 'boolean',
        },
        error: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                },
                message: {
                    type: 'string',
                },
            },
            required: [
                'code',
                'message',
            ],
        },
    },
    required: [
        'success',
        'error',
    ],
} as const;