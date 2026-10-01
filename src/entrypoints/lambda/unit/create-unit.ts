import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

type CreateUnitBody = {
    name: string;
};

export function createUnitHandler(getModule: typeof getUnitModule = getUnitModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!event.body) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body is required'));
        }

        let body: CreateUnitBody;

        try {
            body = JSON.parse(event.body);
        } catch {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body must be valid JSON'));
        }

        if (typeof body.name !== 'string') {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit name must be a string'));
        }

        try {
            const unitModule = await getModule();

            const unit = await unitModule.createUnit.execute({
                organizationId,
                name: body.name,
            });

            return jsonResponse(201, buildSuccessResponse({
                id: unit.unitId,
                organizationId: unit.unitOrganizationId,
                name: unit.unitName.name,
                createdAt: unit.unitCreatedAt,
                updatedAt: unit.unitUpdatedAt,
            }));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = createUnitHandler();