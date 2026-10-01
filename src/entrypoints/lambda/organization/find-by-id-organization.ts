import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getOrganizationModule} from '@entrypoints/lambda/context/organization-context';

export function findByIdOrganizationHandler(getModule: typeof getOrganizationModule = getOrganizationModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const id = event.pathParameters?.id;

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        try {
            const organizationModule = await getModule();

            const organization = await organizationModule.findByIdOrganization.execute({id});

            return jsonResponse(200, buildSuccessResponse({
                id: organization.organizationId,
                name: organization.organizationName.name,
                createdAt: organization.organizationCreatedAt,
                updatedAt: organization.organizationUpdatedAt,
            }));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = findByIdOrganizationHandler();