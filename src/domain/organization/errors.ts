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

export class CostCenterNameRequiredError extends AppError {
    constructor() {
        super(
            'Cost center name cannot be empty',
            'COST_CENTER_NAME_REQUIRED',
            'VALIDATION',
        );
    }
}

export class CostCenterNameTooShortError extends AppError {
    constructor() {
        super(
            'Cost center name must be longer than 2 characters',
            'COST_CENTER_NAME_TOO_SHORT',
            'VALIDATION',
        );
    }
}

export class CostCenterNameTooLongError extends AppError {
    constructor() {
        super(
            'Cost center name cannot be longer than 150 characters',
            'COST_CENTER_NAME_TOO_LONG',
            'VALIDATION',
        );
    }
}

export class CostCenterCodeRequiredError extends AppError {
    constructor() {
        super(
            'Cost center code cannot be empty',
            'COST_CENTER_CODE_REQUIRED',
            'VALIDATION',
        );
    }
}

export class CostCenterCodeTooLongError extends AppError {
    constructor() {
        super(
            'Cost center code cannot be longer than 50 characters',
            'COST_CENTER_CODE_TOO_LONG',
            'VALIDATION',
        );
    }
}
