import type {FastifyReply, FastifyRequest} from 'fastify';
import type {CreateOrganization} from "@application/organization/use-cases/create-organization";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import {organizationSchema, errorSchema} from "@entrypoints/http/schemas";

export const createOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'Create organization',

    description:
        'Creates a new organization.',

    body: {
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
        201: {
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
        409: errorSchema,
    },
} as const;

type CreateOrganizationRequest = {
    name: string;
}

export function createOrganizationHandler(createOrganization: CreateOrganization) {
    return async (request: FastifyRequest<{ Body: CreateOrganizationRequest}>, reply: FastifyReply) => {
        try {
            const organization = await createOrganization.execute({name: request.body.name});

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