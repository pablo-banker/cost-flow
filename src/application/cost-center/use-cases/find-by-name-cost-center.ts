import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';
import {CostCenterNotFoundError} from '@application/cost-center/errors';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import type {CostCenter} from '@domain/organization/entities/cost-center';

export type FindByNameCostCenterInput = {
    organizationId: string;
    unitId: string;
    name: string;
};

export class FindByNameCostCenter {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: FindByNameCostCenterInput): Promise<CostCenter> {
        try {
            return await this.costCenterRepository.findByName(
                input.organizationId,
                input.unitId,
                new CostCenterName(input.name).name,
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
