import type {FastifyReply, FastifyRequest} from "fastify";
import {buildSuccessResponse} from "@entrypoints/http/response";
import {mapErrorToHttp} from "@entrypoints/http/error-mapper";
import type {FindAllOrganization} from "@application/organization/use-cases/find-all-organization";

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