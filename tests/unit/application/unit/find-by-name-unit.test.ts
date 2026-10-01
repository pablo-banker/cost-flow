import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    FindByNameUnit,
    type FindByNameUnitInput,
} from '@application/unit/use-cases/find-by-name-unit';

import {UnitNotFoundError} from '@application/unit/errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('FindByNameUnit', () => {
    let repository: InMemoryUnitRepository;
    let findByNameUnit: FindByNameUnit;

    beforeEach(() => {
        repository = new InMemoryUnitRepository();
        findByNameUnit = new FindByNameUnit(repository);
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

    it('should find a unit by name', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Matriz',
        );

        await repository.create(unit);

        const input: FindByNameUnitInput = {
            organizationId: 'org-123',
            name: 'Matriz',
        };

        const found = await findByNameUnit.execute(input);

        expect(found.unitId).toBe('unit-123');
        expect(found.unitOrganizationId).toBe('org-123');
        expect(found.unitName.name).toBe('Matriz');
    });

    it('should fail when unit does not exist', async () => {
        await expect(
            findByNameUnit.execute({
                organizationId: 'org-123',
                name: 'Matriz',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should not find a unit from another organization', async () => {
        await repository.create(
            makeUnit(
                'unit-123',
                'org-123',
                'Matriz',
            ),
        );

        await expect(
            findByNameUnit.execute({
                organizationId: 'org-456',
                name: 'Matriz',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should allow different organizations to have units with the same name', async () => {
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
                'Matriz',
            ),
        );

        const firstUnit = await findByNameUnit.execute({
            organizationId: 'org-123',
            name: 'Matriz',
        });

        const secondUnit = await findByNameUnit.execute({
            organizationId: 'org-456',
            name: 'Matriz',
        });

        expect(firstUnit.unitId).toBe('unit-123');
        expect(secondUnit.unitId).toBe('unit-456');

        expect(firstUnit.unitOrganizationId).toBe('org-123');
        expect(secondUnit.unitOrganizationId).toBe('org-456');
    });
});