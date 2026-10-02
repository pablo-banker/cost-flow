import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {CostCenterNotFoundError} from '@application/cost-center/errors';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import type {CostCenter} from '@domain/organization/entities/cost-center';

export type FindByCodeCostCenterInput = {
    organizationId: string;
    unitId: string;
    code: string;
};

export class FindByCodeCostCenter {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: FindByCodeCostCenterInput): Promise<CostCenter> {
        try {
            return await this.costCenterRepository.findByCode(
                input.organizationId,
                input.unitId,
                new CostCenterCode(input.code).code,
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
