import {AppError} from '@shared/app-error';

export class CostCenterNotFoundError extends AppError {
    constructor() {
        super(
            'Cost center not found',
            'COST_CENTER_NOT_FOUND',
            'NOT_FOUND',
        );
    }
}

export class CostCenterAlreadyExistsError extends AppError {
    constructor() {
        super(
            'Cost center already exists',
            'COST_CENTER_ALREADY_EXISTS',
            'CONFLICT',
        );
    }
}
