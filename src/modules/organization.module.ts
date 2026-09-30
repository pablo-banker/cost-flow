import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";

import {
    CreateOrganization,
    DeleteOrganization,
    FindAllOrganization,
    FindByIdOrganization,
    FindByNameOrganization,
    UpdateOrganization,
} from '@application/organization/use-cases';

type OrganizationModuleDependencies = {
    organizationRepository: OrganizationRepository;
}

export type OrganizationModule = {
    findAllOrganization: FindAllOrganization;
    findByIdOrganization: FindByIdOrganization;
    findByNameOrganization: FindByNameOrganization;
    createOrganization: CreateOrganization;
    updateOrganization: UpdateOrganization;
    deleteOrganization: DeleteOrganization;
}

export function buildOrganizationModule(dependencies: OrganizationModuleDependencies): OrganizationModule {
    const findAllOrganization = new FindAllOrganization(dependencies.organizationRepository);
    const findByIdOrganization = new FindByIdOrganization(dependencies.organizationRepository);
    const findByNameOrganization = new FindByNameOrganization(dependencies.organizationRepository);
    const createOrganization = new CreateOrganization(dependencies.organizationRepository);
    const updateOrganization = new UpdateOrganization(dependencies.organizationRepository);
    const deleteOrganization = new DeleteOrganization(dependencies.organizationRepository);

    return {
        findAllOrganization,
        findByIdOrganization,
        findByNameOrganization,
        createOrganization,
        updateOrganization,
        deleteOrganization
    }
}