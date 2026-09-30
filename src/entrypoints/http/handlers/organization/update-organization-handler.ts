import type {FastifyReply, FastifyRequest} from 'fastify';
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {UpdateOrganization} from "@application/organization/use-cases/update-organization";


import {
    errorSchema,
    organizationSchema,
} from '@entrypoints/http/schemas';

export const updateOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'Update organization',

    description:
        'Updates an existing organization.',

    params: {
        type: 'object',

        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description:
                    'Organization identifier',
            },
        },

        required: [
            'id',
        ],
    },

    body: {
        type: 'object',

        properties: {
            name: {
                type: 'string',
                description:
                    'New organization name',
            },
        },

        required: [
            'name',
        ],
    },

    response: {
        200: {
            type: 'object',

            properties: {
                success: {
                    type: 'boolean',
                },

                data: organizationSchema,
            },

            required: [
                'success',
                'data',
            ],
        },

        400: errorSchema,
        404: errorSchema,
        409: errorSchema,
    },
} as const;

type UpdateOrganizationParams = {
    id: string;
};

type UpdateOrganizationBody = {
    name: string;
};

export function updateOrganizationHandler(updateOrganization: UpdateOrganization) {
    return async (request: FastifyRequest<{ Params: UpdateOrganizationParams; Body: UpdateOrganizationBody }>, reply: FastifyReply) => {
        try {
            const organization = await updateOrganization.execute({
                id: request.params.id,
                name: request.body.name
            });

            return reply
                .status(201)
                .send(buildSuccessResponse({
                    id: organization.organizationId,
                    name: organization.organizationName.name,
                    createdAt: organization.organizationCreatedAt,
                    updatedAt: organization.organizationUpdatedAt,
                }),
            );
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return reply
                .status(httpError.statusCode)
                .send(httpError.body);
        }
    };
}