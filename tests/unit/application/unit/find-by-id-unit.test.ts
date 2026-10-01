import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    FindByIdUnit,
    type FindByIdUnitInput,
} from '@application/unit/use-cases/find-by-id-unit';

import {UnitNotFoundError} from '@application/unit/errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('FindByIdUnit', () => {
    let repository: InMemoryUnitRepository;
    let findByIdUnit: FindByIdUnit;

    beforeEach(() => {
        repository = new InMemoryUnitRepository();
        findByIdUnit = new FindByIdUnit(repository);
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

    it('should find a unit by id', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Matriz',
        );

        await repository.create(unit);

        const input: FindByIdUnitInput = {
            organizationId: 'org-123',
            id: 'unit-123',
        };

        const found = await findByIdUnit.execute(input);

        expect(found.unitId).toBe(unit.unitId);
        expect(found.unitOrganizationId).toBe('org-123');
        expect(found.unitName.name).toBe('Matriz');
    });

    it('should fail when unit does not exist', async () => {
        await expect(
            findByIdUnit.execute({
                organizationId: 'org-123',
                id: 'unit-123',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should not find a unit from another organization', async () => {
        const unit = makeUnit(
            'unit-123',
            'org-123',
            'Matriz',
        );

        await repository.create(unit);

        await expect(
            findByIdUnit.execute({
                organizationId: 'org-456',
                id: 'unit-123',
            }),
        ).rejects.toBeInstanceOf(UnitNotFoundError);
    });

    it('should find the correct unit when different organizations have different units', async () => {
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

        const found = await findByIdUnit.execute({
            organizationId: 'org-456',
            id: 'unit-456',
        });

        expect(found.unitId).toBe('unit-456');
        expect(found.unitOrganizationId).toBe('org-456');
        expect(found.unitName.name).toBe('Filial');
    });
});