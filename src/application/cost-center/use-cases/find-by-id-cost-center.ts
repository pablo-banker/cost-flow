import {CostCenterNotFoundError} from '@application/cost-center/errors';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import type {CostCenter} from '@domain/organization/entities/cost-center';

export type FindByIdCostCenterInput = {
    organizationId: string;
    unitId: string;
    id: string;
};

export class FindByIdCostCenter {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: FindByIdCostCenterInput): Promise<CostCenter> {
        try {
            return await this.costCenterRepository.findById(
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
