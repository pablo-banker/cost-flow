import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getCostCenterModule} from '@entrypoints/lambda/context/cost-center-context';

export function findByCodeCostCenterHandler(getModule: typeof getCostCenterModule = getCostCenterModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const unitId = event.pathParameters?.unitId;
        const code = event.pathParameters?.code;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!unitId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        if (!code) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Cost center code is required'));
        }

        try {
            const costCenterCode = decodeURIComponent(code);

            const costCenterModule = await getModule();

            const costCenter = await costCenterModule.findByCodeCostCenter.execute({
                organizationId,
                unitId,
                code: costCenterCode,
            });

            return jsonResponse(200, buildSuccessResponse({
                id: costCenter.costCenterId,
                organizationId: costCenter.costCenterOrganizationId,
                unitId: costCenter.costCenterUnitId,
                code: costCenter.costCenterCode.code,
                name: costCenter.costCenterName.name,
                createdAt: costCenter.costCenterCreatedAt,
                updatedAt: costCenter.costCenterUpdatedAt,
            }));
        } catch (error) {
            if (error instanceof URIError) {
                return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Path parameter must be valid URL encoding'));
            }

            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = findByCodeCostCenterHandler();
