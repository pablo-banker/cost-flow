import type { OrganizationRepository } from '@application/ports/repositories/organization-repository';
import type { Organization } from '@domain/organization/entities/organization';

import {PersistenceConflictError, PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

export class InMemoryOrganizationRepository
    implements OrganizationRepository
{
    private organizations: Array<Organization> = [];

    async findAll(): Promise<Organization[]> {
        return [...this.organizations];
    }

    async findById(id: string): Promise<Organization> {
        const organization = this.organizations.find(
            org => org.organizationId === id,
        );

        if (!organization) {
            throw new PersistenceNotFoundError('Organization not found');
        }

        return organization;
    }

    async findByName(name: string): Promise<Organization> {
        const organization = this.organizations.find(
            org => org.organizationName.name === name,
        );

        if (!organization) {
            throw new PersistenceNotFoundError('Organization not found');
        }

        return organization;
    }

    async create(organization: Organization): Promise<void> {
        const alreadyExists = this.organizations.some(
            org =>
                org.organizationId === organization.organizationId ||
                org.organizationName.name === organization.organizationName.name,
        );

        if (alreadyExists) {
            throw new PersistenceConflictError(
                'Organization already exists',
            );
        }

        this.organizations.push(organization);
    }

    async update(organization: Organization): Promise<void> {
        const index = this.organizations.findIndex(
            org => org.organizationId === organization.organizationId,
        );

        if (index === -1) {
            throw new PersistenceNotFoundError(
                'Organization not found',
            );
        }

        const nameConflict = this.organizations.some(
            (org, i) =>
                i !== index &&
                org.organizationName.name === organization.organizationName.name,
        );

        if (nameConflict) {
            throw new PersistenceConflictError(
                'Organization name already exists',
            );
        }

        this.organizations[index] = organization;
    }

    async delete(id: string): Promise<void> {
        const index = this.organizations.findIndex(
            org => org.organizationId === id,
        );

        if (index === -1) {
            throw new PersistenceNotFoundError(
                'Organization not found',
            );
        }

        this.organizations.splice(index, 1);
    }
}