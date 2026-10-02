import {randomUUID} from 'node:crypto';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import type {DataSource, QueryRunner} from 'typeorm';
import {PersistenceConflictError, PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';
import {CostCenter} from '@domain/organization/entities/cost-center';
import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';
import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {getAppDataSource} from '@infrastructure/persistence/typeorm/data-source';
import {OrganizationOrmEntity} from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';
import {UnitOrmEntity} from '@infrastructure/persistence/typeorm/entities/unit.orm-entity';
import {CostCenterOrmEntity} from '@infrastructure/persistence/typeorm/entities/cost-center.orm-entity';
import {TypeOrmCostCenterRepository} from '@infrastructure/persistence/typeorm/repositories/typeorm-cost-center-repository';

describe('TypeOrmCostCenterRepository', () => {
    let dataSource: DataSource;
    let queryRunner: QueryRunner;
    let repository: TypeOrmCostCenterRepository;
    let organizationId: string;
    let otherOrganizationId: string;
    let unitId: string;
    let otherUnitId: string;
    let foreignUnitId: string;

    beforeAll(async () => {
        dataSource = await getAppDataSource();
    });

    beforeEach(async () => {
        queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        await queryRunner.query('TRUNCATE TABLE "cost_centers", "units", "organizations" RESTART IDENTITY CASCADE');
        organizationId = await createOrganization('Organization A');
        otherOrganizationId = await createOrganization('Organization B');
        unitId = await createUnit(organizationId, 'Matriz');
        otherUnitId = await createUnit(organizationId, 'Filial');
        foreignUnitId = await createUnit(otherOrganizationId, 'Matriz');
        repository = new TypeOrmCostCenterRepository(queryRunner.manager.getRepository(CostCenterOrmEntity));
    });

    afterEach(async () => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    async function createOrganization(name: string): Promise<string> {
        const id = randomUUID();
        const now = new Date();
        await queryRunner.manager.getRepository(OrganizationOrmEntity).insert({id, name, createdAt: now, updatedAt: now});
        return id;
    }

    async function createUnit(organizationId: string, name: string): Promise<string> {
        const id = randomUUID();
        const now = new Date();
        await queryRunner.manager.getRepository(UnitOrmEntity).insert({id, organizationId, name, createdAt: now, updatedAt: now});
        return id;
    }

    function makeCenter(code = 'CC-001', name = 'Tecnologia', organization = organizationId, unit = unitId): CostCenter {
        const now = new Date();
        return new CostCenter(randomUUID(), organization, unit, new CostCenterCode(code), new CostCenterName(name), now, now);
    }

    it('creates and maps all fields and timestamps', async () => {
        const center = makeCenter(' CC-001 ', ' Cafe\u0301 ');
        await repository.create(center);
        const found = await repository.findById(organizationId, unitId, center.costCenterId);
        expect(found.costCenterOrganizationId).toBe(organizationId);
        expect(found.costCenterUnitId).toBe(unitId);
        expect(found.costCenterCode.code).toBe('CC-001');
        expect(found.costCenterName.name).toBe('Café');
        expect(found.costCenterCreatedAt).toEqual(center.costCenterCreatedAt);
        expect(found.costCenterUpdatedAt).toEqual(center.costCenterUpdatedAt);
    });

    it('finds by code and name', async () => {
        const center = makeCenter();
        await repository.create(center);
        expect((await repository.findByCode(organizationId, unitId, 'CC-001')).costCenterId).toBe(center.costCenterId);
        expect((await repository.findByName(organizationId, unitId, 'Tecnologia')).costCenterId).toBe(center.costCenterId);
    });

    it('lists only the requested organization and unit', async () => {
        const center = makeCenter();
        await repository.create(center);
        await repository.create(makeCenter('CC-002', 'Financeiro'));
        await repository.create(makeCenter('CC-001', 'Tecnologia', organizationId, otherUnitId));
        await repository.create(makeCenter('CC-001', 'Tecnologia', otherOrganizationId, foreignUnitId));
        expect(await repository.findAllByUnit(organizationId, unitId)).toHaveLength(2);
        expect(await repository.findAllByUnit(otherOrganizationId, unitId)).toEqual([]);
    });

    it.each([['CC-001', 'Financeiro'], ['CC-002', 'Tecnologia']])('rejects duplicate code or name (%s, %s)', async (code, name) => {
        await repository.create(makeCenter());
        await expect(repository.create(makeCenter(code, name))).rejects.toBeInstanceOf(PersistenceConflictError);
    });

    it('allows identical code/name in different units and organizations', async () => {
        await repository.create(makeCenter());
        await repository.create(makeCenter('CC-001', 'Tecnologia', organizationId, otherUnitId));
        await repository.create(makeCenter('CC-001', 'Tecnologia', otherOrganizationId, foreignUnitId));
        expect(await repository.findAllByUnit(organizationId, otherUnitId)).toHaveLength(1);
        expect(await repository.findAllByUnit(otherOrganizationId, foreignUnitId)).toHaveLength(1);
    });

    it.each(['organization', 'unit'])('isolates reads/update/delete by %s', async parent => {
        const center = makeCenter();
        await repository.create(center);
        const org = parent === 'organization' ? otherOrganizationId : organizationId;
        const unit = parent === 'unit' ? otherUnitId : unitId;
        await expect(repository.findById(org, unit, center.costCenterId)).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.findByName(org, unit, 'Tecnologia')).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.findByCode(org, unit, 'CC-001')).rejects.toBeInstanceOf(PersistenceNotFoundError);
        const foreign = new CostCenter(center.costCenterId, org, unit, center.costCenterCode, new CostCenterName('Financeiro'), center.costCenterCreatedAt, new Date());
        await expect(repository.update(foreign)).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.delete(org, unit, center.costCenterId)).rejects.toBeInstanceOf(PersistenceNotFoundError);
        expect((await repository.findById(organizationId, unitId, center.costCenterId)).costCenterName.name).toBe('Tecnologia');
    });

    it('updates only mutable fields even if the persistence entity has changed code/timestamps', async () => {
        const center = makeCenter();
        await repository.create(center);
        const updatedAt = new Date('2026-10-03T00:00:00Z');
        const changed = new CostCenter(center.costCenterId, organizationId, unitId, new CostCenterCode('CC-999'), new CostCenterName('Financeiro'), new Date('2000-01-01'), updatedAt);
        await repository.update(changed);
        const found = await repository.findById(organizationId, unitId, center.costCenterId);
        expect(found.costCenterName.name).toBe('Financeiro');
        expect(found.costCenterCode.code).toBe('CC-001');
        expect(found.costCenterCreatedAt).toEqual(center.costCenterCreatedAt);
        expect(found.costCenterUpdatedAt).toEqual(updatedAt);
    });

    it('rejects update to a name already in the unit and preserves stored state', async () => {
        await repository.create(makeCenter());
        const second = makeCenter('CC-002', 'Financeiro');
        await repository.create(second);
        second.rename('Tecnologia');
        await queryRunner.query('SAVEPOINT conflicting_rename');
        await expect(repository.update(second)).rejects.toBeInstanceOf(PersistenceConflictError);
        await queryRunner.query('ROLLBACK TO SAVEPOINT conflicting_rename');
        expect((await repository.findById(organizationId, unitId, second.costCenterId)).costCenterName.name).toBe('Financeiro');
    });

    it('allows updating to a name present in a different unit', async () => {
        await repository.create(makeCenter('CC-001', 'Tecnologia', organizationId, otherUnitId));
        const center = makeCenter('CC-001', 'Financeiro');
        await repository.create(center);
        center.rename('Tecnologia');
        await repository.update(center);
        expect((await repository.findByName(organizationId, unitId, 'Tecnologia')).costCenterId).toBe(center.costCenterId);
    });

    it('deletes a cost center', async () => {
        const center = makeCenter();
        await repository.create(center);
        await repository.delete(organizationId, unitId, center.costCenterId);
        expect(await repository.findAllByUnit(organizationId, unitId)).toEqual([]);
    });

    it('reports not found for lookup, update and delete', async () => {
        const center = makeCenter();
        await expect(repository.findById(organizationId, unitId, center.costCenterId)).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.findByCode(organizationId, unitId, 'missing')).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.findByName(organizationId, unitId, 'missing')).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.update(center)).rejects.toBeInstanceOf(PersistenceNotFoundError);
        await expect(repository.delete(organizationId, unitId, center.costCenterId)).rejects.toBeInstanceOf(PersistenceNotFoundError);
    });

    it.each(['organization', 'unit'])('enforces %s foreign key', async parent => {
        const center = makeCenter('CC-001', 'Tecnologia', parent === 'organization' ? randomUUID() : organizationId, parent === 'unit' ? randomUUID() : unitId);
        await expect(repository.create(center)).rejects.toMatchObject({driverError: {code: '23503'}});
    });

    it.each(['organization', 'unit'])('cascades deletes from %s', async parent => {
        await repository.create(makeCenter());
        if (parent === 'organization') {
            await queryRunner.manager.getRepository(OrganizationOrmEntity).delete({id: organizationId});
        } else {
            await queryRunner.manager.getRepository(UnitOrmEntity).delete({id: unitId});
        }
        expect(await repository.findAllByUnit(organizationId, unitId)).toEqual([]);
    });
});
