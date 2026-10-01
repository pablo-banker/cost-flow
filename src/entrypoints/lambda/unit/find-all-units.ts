import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

export function findAllUnitsHandler(getModule: typeof getUnitModule = getUnitModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        try {
            const unitModule = await getModule();

            const units = await unitModule.findAllUnits.execute({
                organizationId,
            });

            return jsonResponse(200, buildSuccessResponse(
                units.map(unit => ({
                    id: unit.unitId,
                    organizationId: unit.unitOrganizationId,
                    name: unit.unitName.name,
                    createdAt: unit.unitCreatedAt,
                    updatedAt: unit.unitUpdatedAt,
                })),
            ));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = findAllUnitsHandler();