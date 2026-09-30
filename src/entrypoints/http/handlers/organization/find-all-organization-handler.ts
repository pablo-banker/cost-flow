import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindAllOrganization} from "@application/organization/use-cases/find-all-organization";

import {organizationSchema} from '@entrypoints/http/schemas';

export const findAllOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'List organizations',

    description:
        'Returns all organizations.',

    response: {
        200: {
            type: 'object',

            properties: {
                success: {
                    type: 'boolean',
                },

                data: {
                    type: 'array',
                    items: organizationSchema,
                },
            },

            required: [
                'success',
                'data',
            ],
        },
    },
} as const;



export function findAllOrganizationHandler(findAllOrganization: FindAllOrganization) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const organizations = await findAllOrganization.execute();

            return reply
                .status(200)
                .send(buildSuccessResponse(organizations));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return reply
                .status(httpError.statusCode)
                .send(httpError.body);
        }
    };
}