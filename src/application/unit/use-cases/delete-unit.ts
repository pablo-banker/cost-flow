import {UnitNotFoundError} from '@application/unit/errors';

import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

export type DeleteUnitInput = {
    organizationId: string;
    id: string;
};

export class DeleteUnit {
    constructor(
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: DeleteUnitInput): Promise<void> {
        try {
            await this.unitRepository.delete(
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