import {AppError} from '@shared/app-error';

export class UnitNotFoundError extends AppError {
    constructor() {
        super(
            'Unit not found',
            'UNIT_NOT_FOUND',
            'NOT_FOUND',
        );
    }
}

export class UnitAlreadyExistsError extends AppError {
    constructor() {
        super(
            'Unit already exists',
            'UNIT_ALREADY_EXISTS',
            'CONFLICT',
        );
    }
}