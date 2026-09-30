import {OrganizationNotFoundError} from "@application/organization/errors";
import {PersistenceNotFoundError} from "@application/ports/repositories/persistence-errors";
import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {Organization} from "@domain/organization/entities/organization";

export type FindByIdOrganizationInput = {
    id: string;
}

export class FindByIdOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(input: FindByIdOrganizationInput): Promise<Organization> {
        try {
            return await this.organizationRepository.findById(input.id);
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