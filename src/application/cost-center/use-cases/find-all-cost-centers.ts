import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';

import type {CostCenter} from '@domain/organization/entities/cost-center';

export type FindAllCostCentersInput = {
    organizationId: string;
    unitId: string;
};

export class FindAllCostCenters {
    constructor(
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: FindAllCostCentersInput): Promise<CostCenter[]> {
        return this.costCenterRepository.findAllByUnit(input.organizationId, input.unitId);
    }
}
