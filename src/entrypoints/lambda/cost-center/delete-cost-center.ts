import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getCostCenterModule} from '@entrypoints/lambda/context/cost-center-context';

export function deleteCostCenterHandler(getModule: typeof getCostCenterModule = getCostCenterModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const unitId = event.pathParameters?.unitId;
        const id = event.pathParameters?.id;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!unitId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        if (!id) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'CostCenter id is required'));
        }

        try {
            const costCenterModule = await getModule();

            await costCenterModule.deleteCostCenter.execute({
                organizationId,
                unitId,
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

export const handler = deleteCostCenterHandler();
