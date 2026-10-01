import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    CreateUnit,
    type CreateUnitInput,
} from '@application/unit/use-cases/create-unit';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    UnitAlreadyExistsError,
} from '@application/unit/errors';

import {Organization} from '@domain/organization/entities/organization';

import {
    UnitNameRequiredError,
    UnitNameTooLongError,
    UnitNameTooShortError,
} from '@domain/organization/errors';

import {OrganizationName} from '@domain/organization/value-objects/organization-name';

import {InMemoryOrganizationRepository} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';
import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('CreateUnit', () => {
    let organizationRepository: InMemoryOrganizationRepository;
    let unitRepository: InMemoryUnitRepository;
    let createUnit: CreateUnit;

    beforeEach(async () => {
        organizationRepository = new InMemoryOrganizationRepository();
        unitRepository = new InMemoryUnitRepository();

        createUnit = new CreateUnit(
            organizationRepository,
            unitRepository,
        );

        await createOrganization(
            'org-123',
            'Organization A',
        );

        await createOrganization(
            'org-456',
            'Organization B',
        );
    });

    async function createOrganization(
        id: string,
        name: string,
    ): Promise<void> {
        const now = new Date();

        const organization = new Organization(
            id,
            new OrganizationName(name),
            now,
            now,
        );

        await organizationRepository.create(organization);
    }

    it('should create a valid unit', async () => {
        const input: CreateUnitInput = {
            organizationId: 'org-123',
            name: 'Matriz',
        };

        const unit = await createUnit.execute(input);

        expect(unit.unitId).toBeDefined();
        expect(unit.unitOrganizationId).toBe('org-123');
        expect(unit.unitName.name).toBe('Matriz');
        expect(unit.unitCreatedAt).toBeInstanceOf(Date);
        expect(unit.unitUpdatedAt).toBeInstanceOf(Date);

        const savedUnit = await unitRepository.findById(
            'org-123',
            unit.unitId,
        );

        expect(savedUnit.unitId).toBe(unit.unitId);
        expect(savedUnit.unitOrganizationId).toBe('org-123');
        expect(savedUnit.unitName.name).toBe('Matriz');
    });

    it('should normalize the unit name before creating it', async () => {
        const unit = await createUnit.execute({
            organizationId: 'org-123',
            name: '   Matriz   ',
        });

        expect(unit.unitName.name).toBe('Matriz');
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            createUnit.execute({
                organizationId: 'org-999',
                name: 'Matriz',
            }),
        ).rejects.toBeInstanceOf(OrganizationNotFoundError);

        const units = await unitRepository.findAllByOrganizationId(
            'org-999',
        );

        expect(units).toHaveLength(0);
    });

    it('should fail when unit name is empty', async () => {
        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: '',
            }),
        ).rejects.toBeInstanceOf(UnitNameRequiredError);
    });

    it('should fail when unit name contains only whitespace', async () => {
        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: '       ',
            }),
        ).rejects.toBeInstanceOf(UnitNameRequiredError);
    });

    it('should fail when unit name is too short', async () => {
        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: 'AB',
            }),
        ).rejects.toBeInstanceOf(UnitNameTooShortError);
    });

    it('should fail when unit name is longer than 150 characters', async () => {
        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: 'A'.repeat(151),
            }),
        ).rejects.toBeInstanceOf(UnitNameTooLongError);
    });

    it('should fail when unit with same name already exists in organization', async () => {
        await createUnit.execute({
            organizationId: 'org-123',
            name: 'Matriz',
        });

        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: 'Matriz',
            }),
        ).rejects.toBeInstanceOf(UnitAlreadyExistsError);
    });

    it('should detect duplicated names after normalization', async () => {
        await createUnit.execute({
            organizationId: 'org-123',
            name: 'Matriz',
        });

        await expect(
            createUnit.execute({
                organizationId: 'org-123',
                name: '   Matriz   ',
            }),
        ).rejects.toBeInstanceOf(UnitAlreadyExistsError);
    });

    it('should allow same unit name in different organizations', async () => {
        const firstUnit = await createUnit.execute({
            organizationId: 'org-123',
            name: 'Matriz',
        });

        const secondUnit = await createUnit.execute({
            organizationId: 'org-456',
            name: 'Matriz',
        });

        expect(firstUnit.unitName.name).toBe('Matriz');
        expect(secondUnit.unitName.name).toBe('Matriz');

        expect(firstUnit.unitOrganizationId).toBe('org-123');
        expect(secondUnit.unitOrganizationId).toBe('org-456');

        expect(firstUnit.unitId).not.toBe(secondUnit.unitId);
    });
});