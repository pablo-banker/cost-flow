import {UnitNotFoundError} from '@application/unit/errors';

import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import type {Unit} from '@domain/organization/entities/unit';

export type FindByIdUnitInput = {
    organizationId: string;
    id: string;
};

export class FindByIdUnit {
    constructor(
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: FindByIdUnitInput): Promise<Unit> {
        try {
            return await this.unitRepository.findById(
                input.organizationId,
                input.id,
            );
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new UnitNotFoundError();
        }

        throw error;
    }
}