import { randomUUID } from 'node:crypto';

import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {Organization} from "@domain/organization/entities/organization";
import {OrganizationName} from "@domain/organization/value-objects/organization-name";
import {PersistenceConflictError, PersistenceNotFoundError} from "@application/ports/repositories/persistence-errors";
import {OrganizationAlreadyExistsError, OrganizationNotFoundError} from "@application/organization/errors";

export type UpdateOrganizationInput = {
    id : string;
    name: string;
}

export class UpdateOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(input: UpdateOrganizationInput): Promise<Organization> {
        const organization = this.prepare(input);

        try {
            await this.organizationRepository.update(organization);
        } catch (error) {
            this.handlePersistenceError(error);
        }

        return organization;
    }

    private prepare(input: UpdateOrganizationInput): Organization {
        const organizationName = new OrganizationName(input.name);
        const now = new Date();

        return new Organization(
            input.id,
            organizationName,
            now,
            now,
        );
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw new OrganizationNotFoundError();
        }

        if (error instanceof PersistenceConflictError) {
            throw new OrganizationAlreadyExistsError();
        }

        throw error;
    }
}