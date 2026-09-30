import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindByNameOrganization} from "@application/organization/use-cases/find-by-name-organization";

import {
    errorSchema,
    organizationSchema,
} from '@entrypoints/http/schemas';

export const findByNameOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'Find organization by name',

    description:
        'Returns an organization using its name.',

    params: {
        type: 'object',

        properties: {
            name: {
                type: 'string',
                minLength: 3,
                maxLength: 150,
                description:
                    'Organization name',
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
    },
} as const;

type FindByNameOrganizationParams = {
    name: string;
};

export function findByNameOrganizationHandler(findByNameOrganization: FindByNameOrganization) {
    return async (request: FastifyRequest<{ Params: FindByNameOrganizationParams }>, reply: FastifyReply) => {
        try {
            const organization = await findByNameOrganization.execute({name: request.params.name});

            return reply
                .status(200)
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