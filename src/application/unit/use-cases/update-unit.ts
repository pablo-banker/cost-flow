import {
    UnitAlreadyExistsError,
    UnitNotFoundError,
} from '@application/unit/errors';

import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type {Unit} from '@domain/organization/entities/unit';

export type UpdateUnitInput = {
    organizationId: string;
    id: string;
    name: string;
};

export class UpdateUnit {
    constructor(
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: UpdateUnitInput): Promise<Unit> {
        try {
            const unit = await this.unitRepository.findById(
                input.organizationId,
                input.id,
            );

            unit.rename(input.name);

            await this.unitRepository.update(unit);

            return unit;
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new UnitNotFoundError();
        }

        if (error instanceof PersistenceConflictError) {
            throw new UnitAlreadyExistsError();
        }

        throw error;
    }
}