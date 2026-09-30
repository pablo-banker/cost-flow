export const organizationSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        name: {
            type: 'string',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    required: [
        'id',
        'name',
        'createdAt',
        'updatedAt',
    ],
} as const;
