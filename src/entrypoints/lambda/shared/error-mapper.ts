import { AppError } from '@shared/app-error';

import {
    buildErrorResponse,
    type ErrorResponse,
} from './response';

type HttpError = {
    statusCode: number;
    body: ErrorResponse;
};

const statusCodeByErrorKind = {
    VALIDATION: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
} as const;

export function mapErrorToHttp(
    error: unknown,
): HttpError {
    if (error instanceof AppError) {
        return {
            statusCode:
                statusCodeByErrorKind[error.kind],

            body: buildErrorResponse(
                error.code,
                error.message,
                error.details,
            ),
        };
    }

    return {
        statusCode: 500,
        body: buildErrorResponse(
            'INTERNAL_SERVER_ERROR',
            'Internal server error',
        ),
    };
}