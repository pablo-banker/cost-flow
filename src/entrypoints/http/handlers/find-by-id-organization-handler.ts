import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindByIdOrganization} from "@application/organization/use-cases/find-by-id-organization";

type FindByIdOrganizationRequest = {
    id: string;
}

export function findByIdOrganizationHandler(findByIdOrganization: FindByIdOrganization) {
    return async (request: FastifyRequest<{ Body: FindByIdOrganizationRequest}>, reply: FastifyReply) => {
        try {
            const organization = await findByIdOrganization.execute({id: request.body.id});

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