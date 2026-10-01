import {AppError} from "@shared/app-error";

export class OrganizationNotFoundError extends AppError {
    constructor() {
        super(
            'Organization not found',
            'ORGANIZATION_NOT_FOUND',
            'NOT_FOUND',
        );
    }
}

export class OrganizationAlreadyExistsError extends AppError {
    constructor() {
        super(
            'Organization already exists',
            'ORGANIZATION_ALREADY_EXISTS',
            'CONFLICT',
        );
    }
}