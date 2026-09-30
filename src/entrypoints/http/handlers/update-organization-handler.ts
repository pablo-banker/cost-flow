import type {FastifyReply, FastifyRequest} from 'fastify';
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {UpdateOrganization} from "@application/organization/use-cases/update-organization";

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