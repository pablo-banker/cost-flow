import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getOrganizationModule} from '@entrypoints/lambda/context/organization-context';

type UpdateOrganizationBody = {
    name: string;
};

export function updateOrganizationHandler(getModule: typeof getOrganizationModule = getOrganizationModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const id = event.pathParameters?.id;

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!event.body) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body is required'));
        }

        let body: UpdateOrganizationBody;

        try {
            body = JSON.parse(event.body);
        } catch {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body must be valid JSON'));
        }

        if (typeof body.name !== 'string') {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization name must be a string'));
        }

        try {
            const organizationModule = await getModule();

            const organization = await organizationModule.updateOrganization.execute({
                id,
                name: body.name,
            });

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

export const handler = updateOrganizationHandler();