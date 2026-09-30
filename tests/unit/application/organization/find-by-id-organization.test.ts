import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { CreateOrganization } from '@application/organization/use-cases/create-organization';
import { FindByIdOrganization } from '@application/organization/use-cases/find-by-id-organization';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    InMemoryOrganizationRepository,
} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

describe('FindByIdOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;
    let findByIdOrganization: FindByIdOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();

        createOrganization =
            new CreateOrganization(repository);

        findByIdOrganization =
            new FindByIdOrganization(repository);
    });

    it('should find an organization by id', async () => {
        const createdOrganization =
            await createOrganization.execute({
                name: 'CostFlow',
            });

        const organization =
            await findByIdOrganization.execute({
                id: createdOrganization.organizationId,
            });

        expect(organization.organizationId)
            .toBe(createdOrganization.organizationId);

        expect(organization.organizationName.name)
            .toBe('CostFlow');
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            findByIdOrganization.execute({
                id: 'non-existing-id',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError,
        );
    });
});