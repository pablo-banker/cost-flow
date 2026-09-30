import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { CreateOrganization } from '@application/organization/use-cases/create-organization';
import { UpdateOrganization } from '@application/organization/use-cases/update-organization';

import {
    OrganizationAlreadyExistsError,
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    OrganizationNameRequiredError,
    OrganizationNameTooLongError,
} from '@domain/organization/errors';

import {
    InMemoryOrganizationRepository,
} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

describe('UpdateOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;
    let updateOrganization: UpdateOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();

        createOrganization =
            new CreateOrganization(repository);

        updateOrganization =
            new UpdateOrganization(repository);
    });

    it('should update an organization', async () => {
        const organization =
            await createOrganization.execute({
                name: 'Old Name',
            });

        await updateOrganization.execute({
            id: organization.organizationId,
            name: 'New Name',
        });

        const updatedOrganization =
            await repository.findById(
                organization.organizationId,
            );

        expect(updatedOrganization).not.toBeNull();

        expect(
            updatedOrganization?.organizationName.name,
        ).toBe('New Name');
    });

    it('should normalize the new organization name', async () => {
        const organization =
            await createOrganization.execute({
                name: 'Old Name',
            });

        await updateOrganization.execute({
            id: organization.organizationId,
            name: '   New Name   ',
        });

        const updatedOrganization =
            await repository.findById(
                organization.organizationId,
            );

        expect(
            updatedOrganization?.organizationName.name,
        ).toBe('New Name');
    });

    it('should update updatedAt when organization name changes', async () => {
        vi.useFakeTimers();

        try {
            vi.setSystemTime(
                new Date('2026-09-29T10:00:00.000Z'),
            );

            const organization =
                await createOrganization.execute({
                    name: 'Old Name',
                });

            const originalUpdatedAt =
                organization.organizationUpdatedAt;

            vi.setSystemTime(
                new Date('2026-09-29T11:00:00.000Z'),
            );

            await updateOrganization.execute({
                id: organization.organizationId,
                name: 'New Name',
            });

            const updatedOrganization =
                await repository.findById(
                    organization.organizationId,
                );

            expect(
                updatedOrganization?.organizationUpdatedAt,
            ).not.toEqual(originalUpdatedAt);

            expect(
                updatedOrganization?.organizationUpdatedAt,
            ).toEqual(
                new Date('2026-09-29T11:00:00.000Z'),
            );
        } finally {
            vi.useRealTimers();
        }
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            updateOrganization.execute({
                id: 'non-existing-id',
                name: 'New Name',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError,
        );
    });

    it('should fail when new name is empty', async () => {
        const organization =
            await createOrganization.execute({
                name: 'CostFlow',
            });

        await expect(
            updateOrganization.execute({
                id: organization.organizationId,
                name: '',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNameRequiredError,
        );
    });

    it('should fail when new name is longer than 150 characters', async () => {
        const organization =
            await createOrganization.execute({
                name: 'CostFlow',
            });

        await expect(
            updateOrganization.execute({
                id: organization.organizationId,
                name: 'A'.repeat(151),
            }),
        ).rejects.toBeInstanceOf(
            OrganizationNameTooLongError,
        );
    });

    it('should fail when another organization already uses the new name', async () => {
        await createOrganization.execute({
            name: 'CostFlow',
        });

        const organization =
            await createOrganization.execute({
                name: 'FinanceHub',
            });

        await expect(
            updateOrganization.execute({
                id: organization.organizationId,
                name: 'CostFlow',
            }),
        ).rejects.toBeInstanceOf(
            OrganizationAlreadyExistsError,
        );
    });
});