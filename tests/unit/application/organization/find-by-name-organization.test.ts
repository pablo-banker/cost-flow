import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { CreateOrganization } from '@application/organization/use-cases/create-organization';
import { FindByNameOrganization } from '@application/organization/use-cases/find-by-name-organization';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    InMemoryOrganizationRepository,
} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

describe('FindByNameOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;
    let findByNameOrganization: FindByNameOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();

        createOrganization =
            new CreateOrganization(repository);

        findByNameOrganization =
            new FindByNameOrganization(repository);
    });

    it('should find an organization by name', async () => {
        const createdOrganization =
            await createOrganization.execute({
                name: 'CostFlow',
            });

        const organization =
            await findByNameOrganization.execute({
                name: 'CostFlow',
            });

        expect(organization.organizationId)
            .toBe(createdOrganization.organizationId);

        expect(organization.organizationName.name)
            .toBe('CostFlow');
    });

    it('should normalize organization name before searching', async () => {
        await createOrganization.execute({
            name: 'CostFlow',
        });

        const organization =
            await findByNameOrganization.execute({
                name: '   CostFlow   ',
            });

        expect(organization.organizationName.name,
        ).toBe('CostFlow');
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            findByNameOrganization.execute({
                name: 'Unknown Organization',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError,
        );
    });
});