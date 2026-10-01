import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

export function findByNameUnitHandler(getModule: typeof getUnitModule = getUnitModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const name = event.pathParameters?.name;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!name) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit name is required'));
        }

        try {
            const unitName = decodeURIComponent(name);

            const unitModule = await getModule();

            const unit = await unitModule.findByNameUnit.execute({
                organizationId,
                name: unitName,
            });

            return jsonResponse(200, buildSuccessResponse({
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

export const handler = findByNameUnitHandler();