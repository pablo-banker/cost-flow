import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getUnitModule} from '@entrypoints/lambda/context/unit-context';

type UpdateUnitBody = {
    name: string;
};

export function updateUnitHandler(getModule: typeof getUnitModule = getUnitModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const id = event.pathParameters?.id;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        if (!event.body) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body is required'));
        }

        let body: UpdateUnitBody;

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

            const unit = await unitModule.updateUnit.execute({
                organizationId,
                id,
                name: body.name,
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

export const handler = updateUnitHandler();