import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getCostCenterModule} from '@entrypoints/lambda/context/cost-center-context';

export function findAllCostCentersHandler(getModule: typeof getCostCenterModule = getCostCenterModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const unitId = event.pathParameters?.unitId;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!unitId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        try {
            const costCenterModule = await getModule();

            const costCenters = await costCenterModule.findAllCostCenters.execute({
                organizationId,
                unitId,
            });

            return jsonResponse(200, buildSuccessResponse(
                costCenters.map(costCenter => ({
                    id: costCenter.costCenterId,
                    organizationId: costCenter.costCenterOrganizationId,
                    unitId: costCenter.costCenterUnitId,
                    code: costCenter.costCenterCode.code,
                    name: costCenter.costCenterName.name,
                    createdAt: costCenter.costCenterCreatedAt,
                    updatedAt: costCenter.costCenterUpdatedAt,
                })),
            ));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = findAllCostCentersHandler();
