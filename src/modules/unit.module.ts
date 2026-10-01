import type {OrganizationRepository} from '@application/ports/repositories/organization-repository';
import type {UnitRepository} from '@application/ports/repositories/unit-repository';

import {
    CreateUnit,
    DeleteUnit,
    FindAllUnits,
    FindByIdUnit,
    FindByNameUnit,
    UpdateUnit,
} from '@application/unit/use-cases';

type UnitModuleDependencies = {
    organizationRepository: OrganizationRepository;
    unitRepository: UnitRepository;
};

export type UnitModule = {
    createUnit: CreateUnit;
    findAllUnits: FindAllUnits;
    findByIdUnit: FindByIdUnit;
    findByNameUnit: FindByNameUnit;
    updateUnit: UpdateUnit;
    deleteUnit: DeleteUnit;
};

export function buildUnitModule(dependencies: UnitModuleDependencies): UnitModule {
    const createUnit = new CreateUnit(
        dependencies.organizationRepository,
        dependencies.unitRepository,
    );

    const findAllUnits = new FindAllUnits(dependencies.unitRepository);
    const findByIdUnit = new FindByIdUnit(dependencies.unitRepository);
    const findByNameUnit = new FindByNameUnit(dependencies.unitRepository);
    const updateUnit = new UpdateUnit(dependencies.unitRepository);
    const deleteUnit = new DeleteUnit(dependencies.unitRepository);

    return {
        createUnit,
        findAllUnits,
        findByIdUnit,
        findByNameUnit,
        updateUnit,
        deleteUnit,
    };
}