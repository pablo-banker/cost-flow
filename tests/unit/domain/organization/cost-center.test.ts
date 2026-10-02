import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {describe, expect, it} from 'vitest';

import {CostCenter} from '@domain/organization/entities/cost-center';
import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';

describe('CostCenter', () => {
    it('should create a valid costCenter', () => {
        const id = 'cost-center-123';
        const organizationId = 'org-123';
        const name = 'Matriz Florianópolis';
        const createdAt = new Date();
        const updatedAt = new Date();

        const costCenter = new CostCenter(
            id,
            organizationId,
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName(name),
            createdAt,
            updatedAt,
        );

        expect(costCenter.costCenterId).toBe(id);
        expect(costCenter.costCenterOrganizationId).toBe(organizationId);
        expect(costCenter.costCenterUnitId).toBe('unit-123');
        expect(costCenter.costCenterCode.code).toBe('CC-001');
        expect(costCenter.costCenterName.name).toBe(name);
        expect(costCenter.costCenterCreatedAt).toBe(createdAt);
        expect(costCenter.costCenterUpdatedAt).toBe(updatedAt);
    });

    it('should rename costCenter', () => {
        const costCenter = new CostCenter(
            'cost-center-123',
            'org-123',
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName('Old Name'),
            new Date(),
            new Date('2026-01-01T00:00:00Z'),
        );

        costCenter.rename('New Name');

        expect(costCenter.costCenterName.name).toBe('New Name');
    });

    it('should update updatedAt when renaming costCenter', () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const costCenter = new CostCenter(
            'cost-center-123',
            'org-123',
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName('Old Name'),
            new Date(),
            updatedAt,
        );

        costCenter.rename('New Name');

        expect(costCenter.costCenterUpdatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
    });

    it('should not update updatedAt when renaming to the same name', () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z');

        const costCenter = new CostCenter(
            'cost-center-123',
            'org-123',
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName('Matriz'),
            new Date(),
            updatedAt,
        );

        costCenter.rename('Matriz');

        expect(costCenter.costCenterUpdatedAt).toBe(updatedAt);
    });

    it('should keep organization id unchanged', () => {
        const organizationId = 'org-123';

        const costCenter = new CostCenter(
            'cost-center-123',
            organizationId,
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName('Matriz'),
            new Date(),
            new Date(),
        );

        costCenter.rename('New Name');

        expect(costCenter.costCenterOrganizationId).toBe(organizationId);
        expect(costCenter.costCenterUnitId).toBe('unit-123');
        expect(costCenter.costCenterCode.code).toBe('CC-001');
    });

    it('should reject invalid new name when renaming costCenter', () => {
        const costCenter = new CostCenter(
            'cost-center-123',
            'org-123',
            'unit-123',
            new CostCenterCode('CC-001'),
            new CostCenterName('Matriz'),
            new Date(),
            new Date(),
        );

        expect(() => costCenter.rename(''))
            .toThrow('Cost center name cannot be empty');
    });
});
