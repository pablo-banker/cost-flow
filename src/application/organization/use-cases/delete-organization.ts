import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {PersistenceNotFoundError} from "@application/ports/repositories/persistence-errors";
import {OrganizationNotFoundError} from "@application/organization/errors";

export type DeleteOrganizationInput = {
    id: string;
}

export class DeleteOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(input: DeleteOrganizationInput): Promise<void> {
       try {
            await this.organizationRepository.delete(input.id);
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