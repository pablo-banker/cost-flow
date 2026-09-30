import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";

import {FindAllOrganization} from "@application/organization/use-cases/find-all-organization";
import {FindByIdOrganization} from "@application/organization/use-cases/find-by-id-organization";
import {FindByNameOrganization} from "@application/organization/use-cases/find-by-name-organization";
import {CreateOrganization} from "@application/organization/use-cases/create-organization";
import {UpdateOrganization} from "@application/organization/use-cases/update-organization";
import {DeleteOrganization} from "@application/organization/use-cases/delete-organization";

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