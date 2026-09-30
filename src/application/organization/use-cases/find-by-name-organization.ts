import {OrganizationNotFoundError} from "@application/organization/errors";
import {PersistenceNotFoundError} from "@application/ports/repositories/persistence-errors";
import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import type {Organization} from "@domain/organization/entities/organization";
import {OrganizationName} from "@domain/organization/value-objects/organization-name";

export type FindByNameOrganizationInput = {
    name: string;
}

export class FindByNameOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(input: FindByNameOrganizationInput): Promise<Organization> {
        const organizationName = new OrganizationName(input.name);
        try {
            return await this.organizationRepository.findByName(organizationName.name);
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new OrganizationNotFoundError();
        }

        throw error;
    }
}