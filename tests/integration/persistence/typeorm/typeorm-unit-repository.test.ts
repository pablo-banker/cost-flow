import {randomUUID} from 'node:crypto';

import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import type {
    DataSource,
    QueryRunner,
} from 'typeorm';

import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import {getAppDataSource} from '@infrastructure/persistence/typeorm/data-source';
import {OrganizationOrmEntity} from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';
import {UnitOrmEntity} from '@infrastructure/persistence/typeorm/entities/unit.orm-entity';
import {TypeOrmUnitRepository} from '@infrastructure/persistence/typeorm/repositories/typeorm-unit-repository';

describe('TypeOrmUnitRepository', () => {
    let appDataSource: DataSource;
    let queryRunner: QueryRunner;
    let repository: TypeOrmUnitRepository;

    let organizationId: string;
    let anotherOrganizationId: string;

    beforeAll(async () => {
        appDataSource = await getAppDataSource();
    });

    beforeEach(async () => {
        queryRunner = appDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        await queryRunner.query(`
            TRUNCATE TABLE "cost_centers", "units", "organizations"
            RESTART IDENTITY
            CASCADE
        `);

        organizationId = await createOrganization('Organization A');
        anotherOrganizationId = await createOrganization('Organization B');

        repository = new TypeOrmUnitRepository(
            queryRunner.manager.getRepository(UnitOrmEntity),
        );
    });

    afterEach(async () => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
    });

    afterAll(async () => {
        await appDataSource.destroy();
    });

    async function createOrganization(name: string): Promise<string> {
        const id = randomUUID();
        const now = new Date();

        await queryRunner.manager.getRepository(OrganizationOrmEntity).insert({
            id,
            name,
            createdAt: now,
            updatedAt: now,
        });

        return id;
    }

    function makeUnit(
        organizationId: string,
        name: string,
    ): Unit {
        const now = new Date();

        return new Unit(
            randomUUID(),
            organizationId,
            new UnitName(name),
            now,
            now,
        );
    }

    it('should create and find a unit by id', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        const found = await repository.findById(
            organizationId,
            unit.unitId,
        );

        expect(found.unitId).toBe(unit.unitId);
        expect(found.unitOrganizationId).toBe(organizationId);
        expect(found.unitName.name).toBe('Matriz');
    });

    it('should find all units from an organization', async () => {
        await repository.create(
            makeUnit(organizationId, 'Matriz'),
        );

        await repository.create(
            makeUnit(organizationId, 'Filial'),
        );

        await repository.create(
            makeUnit(anotherOrganizationId, 'Another Unit'),
        );

        const units = await repository.findAllByOrganizationId(
            organizationId,
        );

        expect(units).toHaveLength(2);

        expect(
            units.map(unit => unit.unitName.name),
        ).toEqual(
            expect.arrayContaining([
                'Matriz',
                'Filial',
            ]),
        );
    });

    it('should find a unit by name', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        const found = await repository.findByName(
            organizationId,
            'Matriz',
        );

        expect(found.unitId).toBe(unit.unitId);
        expect(found.unitOrganizationId).toBe(organizationId);
    });

    it('should isolate unit lookup by organization', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        await expect(
            repository.findById(
                anotherOrganizationId,
                unit.unitId,
            ),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });

    it('should allow same unit name in different organizations', async () => {
        const firstUnit = makeUnit(
            organizationId,
            'Matriz',
        );

        const secondUnit = makeUnit(
            anotherOrganizationId,
            'Matriz',
        );

        await repository.create(firstUnit);
        await repository.create(secondUnit);

        const firstFound = await repository.findByName(
            organizationId,
            'Matriz',
        );

        const secondFound = await repository.findByName(
            anotherOrganizationId,
            'Matriz',
        );

        expect(firstFound.unitId).toBe(firstUnit.unitId);
        expect(secondFound.unitId).toBe(secondUnit.unitId);
    });

    it('should fail when unit name already exists in the same organization', async () => {
        await repository.create(
            makeUnit(organizationId, 'Matriz'),
        );

        await expect(
            repository.create(
                makeUnit(organizationId, 'Matriz'),
            ),
        ).rejects.toBeInstanceOf(
            PersistenceConflictError,
        );
    });

    it('should update a unit', async () => {
        const unit = makeUnit(
            organizationId,
            'Old Name',
        );

        await repository.create(unit);

        unit.rename('New Name');

        await repository.update(unit);

        const updated = await repository.findById(
            organizationId,
            unit.unitId,
        );

        expect(updated.unitName.name).toBe('New Name');
    });

    it('should fail when updating a unit from another organization', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        const foreignUnit = new Unit(
            unit.unitId,
            anotherOrganizationId,
            new UnitName('New Name'),
            unit.unitCreatedAt,
            new Date(),
        );

        await expect(
            repository.update(foreignUnit),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });

    it('should fail when updating to a name already used in the same organization', async () => {
        await repository.create(
            makeUnit(organizationId, 'Matriz'),
        );

        const unit = makeUnit(
            organizationId,
            'Filial',
        );

        await repository.create(unit);

        unit.rename('Matriz');

        await expect(
            repository.update(unit),
        ).rejects.toBeInstanceOf(
            PersistenceConflictError,
        );
    });

    it('should delete a unit', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        await repository.delete(
            organizationId,
            unit.unitId,
        );

        await expect(
            repository.findById(
                organizationId,
                unit.unitId,
            ),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });

    it('should not delete a unit from another organization', async () => {
        const unit = makeUnit(
            organizationId,
            'Matriz',
        );

        await repository.create(unit);

        await expect(
            repository.delete(
                anotherOrganizationId,
                unit.unitId,
            ),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );

        const found = await repository.findById(
            organizationId,
            unit.unitId,
        );

        expect(found.unitId).toBe(unit.unitId);
    });

    it('should fail when unit does not exist', async () => {
        await expect(
            repository.findById(
                organizationId,
                randomUUID(),
            ),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });
});
