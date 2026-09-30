import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {
    InMemoryOrganizationRepository
} from "@infrastructure/persistence/memory/repositories/in-memory-organization-repository";

export type PersistenceDriver = 'memory' | 'typeorm';

export type PersistenceModuleDependencies = {
    driver?: PersistenceDriver;
};


export type PersistenceModule = {
    organizationRepository: OrganizationRepository;
}

export function buildPersistenceModule({ driver = 'typeorm' }: PersistenceModuleDependencies = {}): PersistenceModule {
    const organizationRepository =
        driver === 'memory'
            ? new InMemoryOrganizationRepository()
            : new InMemoryOrganizationRepository();

    return {
        organizationRepository,
    };
}