import type {UnitRepository} from '@application/ports/repositories/unit-repository';

import type {Unit} from '@domain/organization/entities/unit';

export type FindAllUnitsInput = {
    organizationId: string;
};

export class FindAllUnits {
    constructor(
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: FindAllUnitsInput): Promise<Unit[]> {
        return this.unitRepository.findAllByOrganizationId(input.organizationId);
    }
}