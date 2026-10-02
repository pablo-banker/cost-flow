import {
    CostCenterAlreadyExistsError,
    CostCenterNotFoundError,
} from '@application/cost-center/errors';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type {CostCenter} from '@domain/organization/entities/cost-center';

export type UpdateCostCenterInput = {
    organizationId: string;
    unitId: string;
    id: string;
    name: string;
};

export class UpdateCostCenter {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: UpdateCostCenterInput): Promise<CostCenter> {
        try {
            const costCenter = await this.costCenterRepository.findById(
                input.organizationId,
                input.unitId,
                input.id,
            );

            costCenter.rename(input.name);

            await this.costCenterRepository.update(costCenter);

            return costCenter;
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new CostCenterNotFoundError();
        }

        if (error instanceof PersistenceConflictError) {
            throw new CostCenterAlreadyExistsError();
        }

        throw error;
    }
}
