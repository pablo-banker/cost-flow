import { randomUUID } from 'node:crypto';

import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";
import {Organization} from "@domain/organization/entities/organization";
import {OrganizationName} from "@domain/organization/value-objects/organization-name";
import {PersistenceConflictError} from "@application/ports/repositories/persistence-errors";
import {OrganizationAlreadyExistsError} from "@application/organization/errors";

export type CreateOrganizationInput = {
    name: string;
}

export class CreateOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(input: CreateOrganizationInput): Promise<Organization> {
        const organization = this.prepare(input);

        try {
            await this.organizationRepository.create(organization);
        } catch (error) {
            this.handlePersistenceError(error);
        }

        return organization;
    }

    private prepare(input: CreateOrganizationInput): Organization {
        const organizationName = new OrganizationName(input.name);
        const now = new Date();

        return new Organization(
            randomUUID(),
            organizationName,
            now,
            now,
        );
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceConflictError) {
            throw new OrganizationAlreadyExistsError();
        }

        throw error;
    }
}