import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getOrganizationModule} from '@entrypoints/lambda/context/organization-context';

export function deleteOrganizationHandler(getModule: typeof getOrganizationModule = getOrganizationModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const id = event.pathParameters?.id;

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        try {
            const organizationModule = await getModule();

            await organizationModule.deleteOrganization.execute({id});

            return {
                statusCode: 204,
                body: '',
            };
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = deleteOrganizationHandler();