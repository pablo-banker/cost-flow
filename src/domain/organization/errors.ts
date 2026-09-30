import { AppError } from '@shared/errors/app-error';

export class OrganizationNameRequiredError extends AppError {
    constructor() {
        super(
            'Organization name cannot be empty',
            'ORGANIZATION_NAME_REQUIRED',
            'VALIDATION',
        );
    }
}

export class OrganizationNameTooShortError extends AppError {
    constructor() {
        super(
            'Organization name must be longer than 2 characters',
            'ORGANIZATION_NAME_TOO_SHORT',
            'VALIDATION',
        );
    }
}

export class OrganizationNameTooLongError extends AppError {
    constructor() {
        super(
            'Organization name cannot be longer than 150 characters',
            'ORGANIZATION_NAME_TOO_LONG',
            'VALIDATION',
        );
    }
}