import type {FastifyReply, FastifyRequest} from 'fastify';
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {UpdateOrganization} from "@application/organization/use-cases/update-organization";

type UpdateOrganizationRequest = {
    id: string;
    name: string;
}

export function updateOrganizationHandler(updateOrganization: UpdateOrganization) {
    return async (request: FastifyRequest<{ Body: UpdateOrganizationRequest}>, reply: FastifyReply) => {
        try {
            const organization = await updateOrganization.execute({
                id: request.body.id,
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