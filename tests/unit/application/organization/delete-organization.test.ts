import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { CreateOrganization } from '@application/organization/use-cases/create-organization';
import { DeleteOrganization } from '@application/organization/use-cases/delete-organization';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    InMemoryOrganizationRepository,
} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

describe('DeleteOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;
    let deleteOrganization: DeleteOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();

        createOrganization =
            new CreateOrganization(repository);

        deleteOrganization =
            new DeleteOrganization(repository);
    });

    it('should delete an organization', async () => {
        const organization =
            await createOrganization.execute({
                name: 'CostFlow',
            });

        await deleteOrganization.execute({
            id: organization.organizationId,
        });

        const deletedOrganization =
            await repository.findById(
                organization.organizationId,
            );

        expect(deletedOrganization).toBeNull();
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            deleteOrganization.execute({
                id: 'non-existing-id',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError,
        );
    });
});