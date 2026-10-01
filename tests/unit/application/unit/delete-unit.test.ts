import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    DeleteUnit,
    type DeleteUnitInput,
} from '@application/unit/use-cases/delete-unit';

import {UnitNotFoundError} from '@application/unit/errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('DeleteUnit', () => {
    let repository: InMemoryUnitRepository;
    let deleteUnit: DeleteUnit;

    beforeEach(() => {
        repository = new InMemoryUnitRepository();
        deleteUnit = new DeleteUnit(repository);
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

    it('should delete a unit', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Matriz',
        );

        await repository.create(unit);

        const input: DeleteUnitInput = {
            organizationId: 'org-123',
            id: 'unit-123',
        };

        await deleteUnit.execute(input);

        await expect(
            repository.findById(
                'org-123',
                'unit-123',
            ),
        ).rejects.toThrow('Unit not found');
    });

    it('should fail when unit does not exist', async () => {
        await expect(
            deleteUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should not delete a unit from another organization', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            deleteUnit.execute({
                organizationId: 'org-456',
                id: 'unit-123',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);

        const unit = await repository.findById(
            'org-123',
            'unit-123',
        );

        expect(unit.unitId).toBe('unit-123');
        expect(unit.unitOrganizationId).toBe('org-123');
        expect(unit.unitName.name).toBe('Matriz');
    });

    it('should delete only the requested unit from the organization', async () => {
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

        await deleteUnit.execute({
            organizationId: 'org-123',
            id: 'unit-123',
        });

        const units = await repository.findAllByOrganizationId(
            'org-123',
        );

        expect(units).toHaveLength(1);
        expect(units[0]?.unitId).toBe('unit-456');
        expect(units[0]?.unitName.name).toBe('Filial');
    });
});