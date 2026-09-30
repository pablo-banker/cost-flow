import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {DeleteOrganization} from "@application/organization/use-cases/delete-organization";

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