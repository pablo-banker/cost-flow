import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

export function findByIdUnitHandler(getModule: typeof getUnitModule = getUnitModule) {
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

            const unit = await unitModule.findByIdUnit.execute({
                organizationId,
                id,
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

export const handler = findByIdUnitHandler();