import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import type {OrganizationModule} from '@modules/organization.module';

import {getOrganizationModule} from '@entrypoints/lambda/context/organization-context';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

type CreateOrganizationBody = {
    name: string;
};

export function createOrganizationHandler(getModule: typeof getOrganizationModule = getOrganizationModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        if (!event.body) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body is required'));
        }

        let body: CreateOrganizationBody;

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

            const organization = await organizationModule.createOrganization.execute({name: body.name});

            return jsonResponse(201, buildSuccessResponse({
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

export const handler = createOrganizationHandler();