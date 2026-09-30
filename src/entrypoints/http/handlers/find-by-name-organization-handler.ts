import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindByNameOrganization} from "@application/organization/use-cases/find-by-name-organization";

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