import {CostCenterNotFoundError} from '@application/cost-center/errors';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

export type DeleteCostCenterInput = {
    organizationId: string;
    unitId: string;
    id: string;
};

export class DeleteCostCenter {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: DeleteCostCenterInput): Promise<void> {
        try {
            await this.costCenterRepository.delete(
                input.organizationId,
                input.unitId,
                input.id,
            );
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new CostCenterNotFoundError();
        }

        throw error;
    }
}
