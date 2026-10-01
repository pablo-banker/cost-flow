import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

export function deleteUnitHandler(getModule: typeof getUnitModule = getUnitModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const id = event.pathParameters?.id;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        try {
            const unitModule = await getModule();

            await unitModule.deleteUnit.execute({
                organizationId,
                id,
            });

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

export const handler = deleteUnitHandler();