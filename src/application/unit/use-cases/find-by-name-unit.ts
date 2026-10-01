import {UnitNotFoundError} from '@application/unit/errors';

import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import type {Unit} from '@domain/organization/entities/unit';

export type FindByNameUnitInput = {
    organizationId: string;
    name: string;
};

export class FindByNameUnit {
    constructor(
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: FindByNameUnitInput): Promise<Unit> {
        try {
            return await this.unitRepository.findByName(
                input.organizationId,
                input.name,
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