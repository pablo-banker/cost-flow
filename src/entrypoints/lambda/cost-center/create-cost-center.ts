import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {
    buildErrorResponse,
    buildSuccessResponse,
    jsonResponse,
    mapErrorToHttp,
} from '@entrypoints/lambda/shared';

import {getCostCenterModule} from '@entrypoints/lambda/context/cost-center-context';

type CreateCostCenterBody = {
    code: string;
    name: string;
};

export function createCostCenterHandler(getModule: typeof getCostCenterModule = getCostCenterModule) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const organizationId = event.pathParameters?.organizationId;
        const unitId = event.pathParameters?.unitId;

        if (!organizationId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Organization id is required'));
        }

        if (!unitId) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Unit id is required'));
        }

        if (!event.body) {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body is required'));
        }

        let body: CreateCostCenterBody;

        try {
            body = JSON.parse(event.body);
        } catch {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Request body must be valid JSON'));
        }

        if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.name !== 'string') {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Cost center name must be a string'));
        }

        if (typeof body.code !== 'string') {
            return jsonResponse(400, buildErrorResponse('VALIDATION_ERROR', 'Cost center code must be a string'));
        }

        try {
            const costCenterModule = await getModule();

            const costCenter = await costCenterModule.createCostCenter.execute({
                organizationId,
                unitId,
                code: body.code,
                name: body.name,
            });

            return jsonResponse(201, buildSuccessResponse({
                id: costCenter.costCenterId,
                organizationId: costCenter.costCenterOrganizationId,
                unitId: costCenter.costCenterUnitId,
                code: costCenter.costCenterCode.code,
                name: costCenter.costCenterName.name,
                createdAt: costCenter.costCenterCreatedAt,
                updatedAt: costCenter.costCenterUpdatedAt,
            }));
        } catch (error) {
            const httpError = mapErrorToHttp(error);

            return jsonResponse(httpError.statusCode, httpError.body);
        }
    };
}

export const handler = createCostCenterHandler();
