import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {DeleteOrganization} from "@application/organization/use-cases/delete-organization";

import {errorSchema} from '@entrypoints/http/schemas';

export const deleteOrganizationSchema = {
    tags: ['Organizations'],

    summary: 'Delete organization',

    description:
        'Deletes an organization using its identifier.',

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
        204: {
            type: 'null',
        },

        400: errorSchema,
        404: errorSchema,
    },
} as const;

type DeleteOrganizationParams = {
    id: string;
};

export function deleteOrganizationHandler(deleteOrganization: DeleteOrganization) {
    return async (request: FastifyRequest<{ Params: DeleteOrganizationParams }>, reply: FastifyReply) => {
        try {
            await deleteOrganization.execute({id: request.params.id});

            return reply
                .status(204)
                .send();
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return reply
                .status(httpError.statusCode)
                .send(httpError.body);
        }
    };
}