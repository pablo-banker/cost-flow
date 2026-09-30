import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {DeleteOrganization} from "@application/organization/use-cases/delete-organization";

type DeleteOrganizationRequest = {
    id: string;
}

export function deleteOrganizationHandler(deleteOrganization: DeleteOrganization) {
    return async (request: FastifyRequest<{ Body: DeleteOrganizationRequest}>, reply: FastifyReply) => {
        try {
            await deleteOrganization.execute({id: request.body.id});

            return reply
                .status(204)
                .send(buildSuccessResponse({
                    message: "Organization deleted successfully",
                }));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return reply
                .status(httpError.statusCode)
                .send(httpError.body);
        }
    };
}