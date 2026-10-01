import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    FindAllUnits,
    type FindAllUnitsInput,
} from '@application/unit/use-cases/find-all-units';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

describe('FindAllUnits', () => {
    let repository: InMemoryUnitRepository;
    let findAllUnits: FindAllUnits;

    beforeEach(() => {
        repository = new InMemoryUnitRepository();
        findAllUnits = new FindAllUnits(repository);
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

    it('should return an empty array when organization has no units', async () => {
        const input: FindAllUnitsInput = {
            organizationId: 'org-123',
        };

        const units = await findAllUnits.execute(input);

        expect(units).toEqual([]);
    });

    it('should return all units from an organization', async () => {
        await repository.create(
            makeUnit(
                'unit-1',
                'org-123',
                'Matriz',
            ),
        );

        await repository.create(
            makeUnit(
                'unit-2',
                'org-123',
                'Filial',
            ),
        );

        const units = await findAllUnits.execute({
            organizationId: 'org-123',
        });

        expect(units).toHaveLength(2);

        expect(
            units.map(unit => unit.unitName.name),
        ).toEqual([
            'Matriz',
            'Filial',
        ]);
    });

    it('should return only units from the requested organization', async () => {
        await repository.create(
            makeUnit(
                'unit-1',
                'org-123',
                'Matriz',
            ),
        );

        await repository.create(
            makeUnit(
                'unit-2',
                'org-123',
                'Filial',
            ),
        );

        await repository.create(
            makeUnit(
                'unit-3',
                'org-456',
                'Outra Unidade',
            ),
        );

        const units = await findAllUnits.execute({
            organizationId: 'org-123',
        });

        expect(units).toHaveLength(2);

        expect(
            units.every(
                unit => unit.unitOrganizationId === 'org-123',
            ),
        ).toBe(true);

        expect(
            units.map(unit => unit.unitName.name),
        ).toEqual([
            'Matriz',
            'Filial',
        ]);
    });

    it('should not expose units from another organization', async () => {
        await repository.create(
            makeUnit(
                'unit-1',
                'org-456',
                'Matriz',
            ),
        );

        const units = await findAllUnits.execute({
            organizationId: 'org-123',
        });

        expect(units).toEqual([]);
    });
});