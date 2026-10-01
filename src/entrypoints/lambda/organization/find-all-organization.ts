import type {APIGatewayProxyResult} from 'aws-lambda';

import {
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getOrganizationModule} from '@entrypoints/lambda/context/organization-context';

export function findAllOrganizationHandler(getModule: typeof getOrganizationModule = getOrganizationModule) {
    return async (): Promise<APIGatewayProxyResult> => {
        try {
            const organizationModule = await getModule();

            const organizations = await organizationModule.findAllOrganization.execute();

            return jsonResponse(200, buildSuccessResponse(organizations));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = findAllOrganizationHandler();