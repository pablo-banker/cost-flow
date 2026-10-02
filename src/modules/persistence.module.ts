import {InMemoryCostCenterRepository} from '@infrastructure/persistence/memory/repositories/in-memory-cost-center-repository';
import {TypeOrmCostCenterRepository} from '@infrastructure/persistence/typeorm/repositories/typeorm-cost-center-repository';
import {CostCenterOrmEntity} from '@infrastructure/persistence/typeorm/entities/cost-center.orm-entity';
import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';

import type {DataSource} from "typeorm";

import {InMemoryOrganizationRepository} from "@infrastructure/persistence/memory/repositories/in-memory-organization-repository";
import {TypeOrmOrganizationRepository} from "@infrastructure/persistence/typeorm/repositories/typeorm-organization-repository";
import {OrganizationOrmEntity} from "@infrastructure/persistence/typeorm/entities/organization.orm-entity";
import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";

import {InMemoryUnitRepository} from "@infrastructure/persistence/memory/repositories/in-memory-unit-repository";
import {TypeOrmUnitRepository} from "@infrastructure/persistence/typeorm/repositories/typeorm-unit-repository";
import {UnitOrmEntity} from "@infrastructure/persistence/typeorm/entities/unit.orm-entity";
import type {UnitRepository} from "@application/ports/repositories/unit-repository";

export type PersistenceDriver = 'memory' | 'typeorm';

export type PersistenceModuleDependencies = {
    driver?: PersistenceDriver,
    dataSource?: DataSource;
};


export type PersistenceModule = {
    organizationRepository: OrganizationRepository,
    unitRepository: UnitRepository;
    costCenterRepository: CostCenterRepository;
}

export function buildPersistenceModule({ driver = 'typeorm', dataSource }: PersistenceModuleDependencies = {}): PersistenceModule {
    if (driver === 'memory') {
        return {
            organizationRepository: new InMemoryOrganizationRepository(),
            unitRepository: new InMemoryUnitRepository(),
            costCenterRepository: new InMemoryCostCenterRepository(),
        };
    }

    if (!dataSource) {
        throw new Error('DataSource is required when using TypeORM persistence');
    }

    const organizationRepository = new TypeOrmOrganizationRepository(dataSource.getRepository(OrganizationOrmEntity));
    const unitRepository = new TypeOrmUnitRepository(dataSource.getRepository(UnitOrmEntity));

    const costCenterRepository = new TypeOrmCostCenterRepository(dataSource.getRepository(CostCenterOrmEntity));

    return {
        costCenterRepository,
        organizationRepository,
        unitRepository,
    };
}
