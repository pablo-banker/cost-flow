export type SuccessResponse<T> = {
    success: true;
    data: T;
};

export type ErrorResponse = {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
};

export function buildSuccessResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

export function buildErrorResponse(code: string, message: string, details?: Record<string, unknown>): ErrorResponse {
    return {
        success: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };
}