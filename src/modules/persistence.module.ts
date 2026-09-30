import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {
    InMemoryOrganizationRepository
} from "@infrastructure/persistence/memory/repositories/in-memory-organization-repository";
import {OrganizationOrmEntity} from "@infrastructure/persistence/typeorm/entities/organization.orm-entity";
import {
    TypeOrmOrganizationRepository
} from "@infrastructure/persistence/typeorm/repositories/typeorm-organization-repository";
import type {DataSource} from "typeorm";

export type PersistenceDriver = 'memory' | 'typeorm';

export type PersistenceModuleDependencies = {
    driver?: PersistenceDriver,
    dataSource?: DataSource;
};


export type PersistenceModule = {
    organizationRepository: OrganizationRepository;
}

export function buildPersistenceModule({ driver = 'typeorm', dataSource }: PersistenceModuleDependencies = {}): PersistenceModule {
    if (driver === 'memory') {
        return {
            organizationRepository: new InMemoryOrganizationRepository(),
        };
    }

    if (!dataSource) {
        throw new Error('DataSource is required when using TypeORM persistence');
    }

    const organizationRepository = new TypeOrmOrganizationRepository(dataSource.getRepository(OrganizationOrmEntity));

    return {
        organizationRepository,
    };
}