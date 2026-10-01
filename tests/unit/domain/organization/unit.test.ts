import {describe, expect, it} from 'vitest';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

describe('Unit', () => {
    it('should create a valid unit', () => {
        const id = 'unit-123';
        const organizationId = 'org-123';
        const name = 'Matriz Florianópolis';
        const createdAt = new Date();
        const updatedAt = new Date();

        const unit = new Unit(
            id,
            organizationId,
            new UnitName(name),
            createdAt,
            updatedAt,
        );

        expect(unit.unitId).toBe(id);
        expect(unit.unitOrganizationId).toBe(organizationId);
        expect(unit.unitName.name).toBe(name);
        expect(unit.unitCreatedAt).toBe(createdAt);
        expect(unit.unitUpdatedAt).toBe(updatedAt);
    });

    it('should rename unit', () => {
        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Old Name'),
            new Date(),
            new Date('2026-01-01T00:00:00Z'),
        );

        unit.rename('New Name');

        expect(unit.unitName.name).toBe('New Name');
    });

    it('should update updatedAt when renaming unit', () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Old Name'),
            new Date(),
            updatedAt,
        );

        unit.rename('New Name');

        expect(unit.unitUpdatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
    });

    it('should not update updatedAt when renaming to the same name', () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Matriz'),
            new Date(),
            updatedAt,
        );

        unit.rename('Matriz');

        expect(unit.unitUpdatedAt).toBe(updatedAt);
    });

    it('should keep organization id unchanged', () => {
        const organizationId = 'org-123';

        const unit = new Unit(
            'unit-123',
            organizationId,
            new UnitName('Matriz'),
            new Date(),
            new Date(),
        );

        unit.rename('New Name');

        expect(unit.unitOrganizationId).toBe(organizationId);
    });

    it('should reject invalid new name when renaming unit', () => {
        const unit = new Unit(
            'unit-123',
            'org-123',
            new UnitName('Matriz'),
            new Date(),
            new Date(),
        );

        expect(() => unit.rename(''))
            .toThrow('Unit name cannot be empty');
    });
});