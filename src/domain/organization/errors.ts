import {AppError} from '@shared/app-error';

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

export class UnitNameRequiredError extends AppError {
    constructor() {
        super(
            'Unit name cannot be empty',
            'UNIT_NAME_REQUIRED',
            'VALIDATION',
        );
    }
}

export class UnitNameTooShortError extends AppError {
    constructor() {
        super(
            'Unit name must be longer than 2 characters',
            'UNIT_NAME_TOO_SHORT',
            'VALIDATION',
        );
    }
}

export class UnitNameTooLongError extends AppError {
    constructor() {
        super(
            'Unit name cannot be longer than 150 characters',
            'UNIT_NAME_TOO_LONG',
            'VALIDATION',
        );
    }
}