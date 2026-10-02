import type {OrganizationRepository} from '@application/ports/repositories/organization-repository';
import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';

import {
    CreateCostCenter,
    DeleteCostCenter,
    FindAllCostCenters,
    FindByIdCostCenter,
    FindByNameCostCenter,
    FindByCodeCostCenter,
    UpdateCostCenter,
} from '@application/cost-center/use-cases';

type CostCenterModuleDependencies = {
    organizationRepository: OrganizationRepository;
    unitRepository: UnitRepository;
    costCenterRepository: CostCenterRepository;
};

export type CostCenterModule = {
    createCostCenter: CreateCostCenter;
    findAllCostCenters: FindAllCostCenters;
    findByIdCostCenter: FindByIdCostCenter;
    findByNameCostCenter: FindByNameCostCenter;
    findByCodeCostCenter: FindByCodeCostCenter;
    updateCostCenter: UpdateCostCenter;
    deleteCostCenter: DeleteCostCenter;
};

export function buildCostCenterModule(dependencies: CostCenterModuleDependencies): CostCenterModule {
    const createCostCenter = new CreateCostCenter(
        dependencies.organizationRepository,
        dependencies.unitRepository,
        dependencies.costCenterRepository,
    );

    const findAllCostCenters = new FindAllCostCenters(dependencies.costCenterRepository);
    const findByIdCostCenter = new FindByIdCostCenter(dependencies.costCenterRepository);
    const findByNameCostCenter = new FindByNameCostCenter(dependencies.costCenterRepository);
    const findByCodeCostCenter = new FindByCodeCostCenter(dependencies.costCenterRepository);
    const updateCostCenter = new UpdateCostCenter(dependencies.costCenterRepository);
    const deleteCostCenter = new DeleteCostCenter(dependencies.costCenterRepository);

    return {
        createCostCenter,
        findAllCostCenters,
        findByIdCostCenter,
        findByNameCostCenter,
        findByCodeCostCenter,
        updateCostCenter,
        deleteCostCenter,
    };
}
