import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindByIdOrganization} from "@application/organization/use-cases/find-by-id-organization";

import {errorSchema, organizationSchema} from '@entrypoints/http/schemas';

export const findByIdOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'Find organization by id',

    description:
        'Returns an organization using its identifier.',

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

type FindByIdOrganizationParams = {
    id: string;
};

export function findByIdOrganizationHandler(findByIdOrganization: FindByIdOrganization) {
    return async (request: FastifyRequest<{Params: FindByIdOrganizationParams}>, reply: FastifyReply) => {
        try {
            const organization =
                await findByIdOrganization.execute({
                    id: request.params.id,
                });

            return reply
                .status(200)
                .send(buildSuccessResponse({
                    id: organization.organizationId,
                    name: organization.organizationName.name,
                    createdAt: organization.organizationCreatedAt,
                    updatedAt: organization.organizationUpdatedAt,
                }));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return reply
                .status(httpError.statusCode)
                .send(httpError.body);
        }
    };
}
