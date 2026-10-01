import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    UpdateUnit,
    type UpdateUnitInput,
} from '@application/unit/use-cases/update-unit';

import {
    UnitAlreadyExistsError,
    UnitNotFoundError,
} from '@application/unit/errors';

import {
    UnitNameRequiredError,
    UnitNameTooLongError,
    UnitNameTooShortError,
} from '@domain/organization/errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('UpdateUnit', () => {
    let repository: InMemoryUnitRepository;
    let updateUnit: UpdateUnit;

    beforeEach(() => {
        repository = new InMemoryUnitRepository();
        updateUnit = new UpdateUnit(repository);
    });

    function makeUnit(
        id: string,
        organizationId: string,
        name: string,
    ): Unit {
        const now = new Date();

        return new Unit(
            id,
            organizationId,
            new UnitName(name),
            now,
            now,
        );
    }

    it('should update a unit', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Old Name',
        );

        await repository.create(unit);

        const input: UpdateUnitInput = {
            organizationId: 'org-123',
            id: 'unit-123',
            name: 'New Name',
        };

        const updated = await updateUnit.execute(input);

        expect(updated.unitId).toBe('unit-123');
        expect(updated.unitOrganizationId).toBe('org-123');
        expect(updated.unitName.name).toBe('New Name');

        const savedUnit = await repository.findById(
            'org-123',
            'unit-123',
        );

        expect(savedUnit.unitName.name).toBe('New Name');
    });

    it('should normalize unit name when updating', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Old Name',
        );

        await repository.create(unit);

        const updated = await updateUnit.execute({
            organizationId: 'org-123',
            id: 'unit-123',
            name: '   New Name   ',
        });

        expect(updated.unitName.name).toBe('New Name');
    });

    it('should update updatedAt when changing the name', async () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Old Name'),
            new Date('2026-01-01T00:00:00Z'),
            updatedAt,
        );

        await repository.create(unit);

        const updated = await updateUnit.execute({
            organizationId: 'org-123',
            id: 'unit-123',
            name: 'New Name',
        });

        expect(updated.unitUpdatedAt.getTime()).toBeGreaterThan(
            updatedAt.getTime(),
        );
    });

    it('should not update updatedAt when name does not change', async () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Matriz'),
            new Date('2026-01-01T00:00:00Z'),
            updatedAt,
        );

        await repository.create(unit);

        const updated = await updateUnit.execute({
            organizationId: 'org-123',
            id: 'unit-123',
            name: 'Matriz',
        });

        expect(updated.unitUpdatedAt).toBe(updatedAt);
    });

    it('should fail when unit does not exist', async () => {
        await expect(
            updateUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
                name: 'New Name',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should not update a unit from another organization', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            updateUnit.execute({
                organizationId: 'org-456',
                id: 'unit-123',
                name: 'New Name',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);

        const unit = await repository.findById(
            'org-123',
            'unit-123',
        );

        expect(unit.unitName.name).toBe('Matriz');
    });

    it('should fail when new name is empty', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            updateUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
                name: '',
            }),
        ).rejects.toBeInstanceOf(UnitNameRequiredError);
    });

    it('should fail when new name is too short', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            updateUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
                name: 'AB',
            }),
        ).rejects.toBeInstanceOf(UnitNameTooShortError);
    });

    it('should fail when new name is longer than 150 characters', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            updateUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
                name: 'A'.repeat(151),
            }),
        ).rejects.toBeInstanceOf(UnitNameTooLongError);
    });

    it('should fail when another unit already uses the new name in the same organization', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await repository.create(
            makeUnit(
                'unit-456',
                'org-123',
                'Filial',
            ),
        );

        await expect(
            updateUnit.execute({
                organizationId: 'org-123',
                id: 'unit-456',
                name: 'Matriz',
            }),
        ).rejects.toBeInstanceOf(UnitAlreadyExistsError);
    });

    it('should allow same unit name when it belongs to another organization', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await repository.create(
            makeUnit(
                'unit-456',
                'org-456',
                'Filial',
            ),
        );

        const updated = await updateUnit.execute({
            organizationId: 'org-456',
            id: 'unit-456',
            name: 'Matriz',
        });

        expect(updated.unitName.name).toBe('Matriz');
        expect(updated.unitOrganizationId).toBe('org-456');
    });
});