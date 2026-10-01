import type {APIGatewayProxyResult} from 'aws-lambda';
import {jsonResponse} from "@entrypoints/lambda/shared";

export async function handler(): Promise<APIGatewayProxyResult> {
    return jsonResponse(
        200,
        {
            status: 'ok',
        },
    );
}