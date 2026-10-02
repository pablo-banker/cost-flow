import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OrganizationNotFoundError} from '@application/organization/errors';
import {UnitNotFoundError} from '@application/unit/errors';
import {CostCenterAlreadyExistsError, CostCenterNotFoundError} from '@application/cost-center/errors';
import {Organization} from '@domain/organization/entities/organization';
import {OrganizationName} from '@domain/organization/value-objects/organization-name';
import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';
import {buildPersistenceModule} from '@modules/persistence.module';
import {buildCostCenterModule, type CostCenterModule} from '@modules/cost-center.module';

describe('CostCenter use cases', () => {
    let persistence: ReturnType<typeof buildPersistenceModule>;
    let module: CostCenterModule;
    const scope = {organizationId: 'org-a', unitId: 'unit-a'};
    const input = {...scope, code: 'CC-001', name: 'Tecnologia'};

    beforeEach(async () => {
        persistence = buildPersistenceModule({driver: 'memory'});
        module = buildCostCenterModule(persistence);
        const now = new Date();
        for (const id of ['org-a', 'org-b']) {
            await persistence.organizationRepository.create(new Organization(id, new OrganizationName(id), now, now));
        }
        for (const [id, organizationId] of [['unit-a', 'org-a'], ['unit-b', 'org-a'], ['unit-c', 'org-b']]) {
            await persistence.unitRepository.create(new Unit(id!, organizationId!, new UnitName(id!), now, now));
        }
    });

    it('creates and persists a normalized cost center with UUID and timestamps', async () => {
        const center = await module.createCostCenter.execute({...input, code: ' CC-001 ', name: ' Cafe\u0301 '});
        expect(center.costCenterId).toMatch(/^[0-9a-f-]{36}$/);
        expect(center.costCenterName.name).toBe('Café');
        expect(center.costCenterCode.code).toBe('CC-001');
        expect(center.costCenterCreatedAt).toBeInstanceOf(Date);
        const found = await module.findByIdCostCenter.execute({...scope, id: center.costCenterId});
        expect(found.costCenterName.name).toBe('Café');
    });

    it('validates organization before unit or persistence', async () => {
        const findUnit = vi.spyOn(persistence.unitRepository, 'findById');
        const create = vi.spyOn(persistence.costCenterRepository, 'create');
        await expect(module.createCostCenter.execute({...input, organizationId: 'missing'})).rejects.toBeInstanceOf(OrganizationNotFoundError);
        expect(findUnit).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });

    it.each(['missing', 'unit-c'])('rejects missing or foreign unit %s', async unitId => {
        await expect(module.createCostCenter.execute({...input, unitId})).rejects.toBeInstanceOf(UnitNotFoundError);
        expect(await module.findAllCostCenters.execute({...scope, unitId})).toHaveLength(0);
    });

    it.each([
        {code: ' CC-001 ', name: 'Financeiro'},
        {code: 'CC-002', name: ' Tecnologia '},
    ])('rejects normalized duplicate code/name %j', async duplicate => {
        await module.createCostCenter.execute(input);
        await expect(module.createCostCenter.execute({...scope, ...duplicate})).rejects.toBeInstanceOf(CostCenterAlreadyExistsError);
    });

    it('allows the same code and name in different units and organizations', async () => {
        for (const parent of [scope, {...scope, unitId: 'unit-b'}, {organizationId: 'org-b', unitId: 'unit-c'}]) {
            await module.createCostCenter.execute({...input, ...parent});
            expect(await module.findAllCostCenters.execute(parent)).toHaveLength(1);
        }
    });

    it('finds by normalized name and code', async () => {
        const center = await module.createCostCenter.execute(input);
        expect((await module.findByNameCostCenter.execute({...scope, name: ' Tecnologia '})).costCenterId).toBe(center.costCenterId);
        expect((await module.findByCodeCostCenter.execute({...scope, code: ' CC-001 '})).costCenterId).toBe(center.costCenterId);
    });

    it.each([{organizationId: 'org-b', unitId: 'unit-a'}, {...scope, unitId: 'unit-b'}])('isolates all reads, update and delete for %j', async parent => {
        const center = await module.createCostCenter.execute(input);
        const id = center.costCenterId;
        expect(await module.findAllCostCenters.execute(parent)).toHaveLength(0);
        for (const operation of [
            module.findByIdCostCenter.execute({...parent, id}),
            module.findByCodeCostCenter.execute({...parent, code: input.code}),
            module.findByNameCostCenter.execute({...parent, name: input.name}),
            module.updateCostCenter.execute({...parent, id, name: 'Financeiro'}),
            module.deleteCostCenter.execute({...parent, id}),
        ]) {
            await expect(operation).rejects.toBeInstanceOf(CostCenterNotFoundError);
        }
        expect((await module.findByIdCostCenter.execute({...scope, id})).costCenterName.name).toBe(input.name);
    });

    it('updates only name and preserves immutable fields', async () => {
        const center = await module.createCostCenter.execute(input);
        const updated = await module.updateCostCenter.execute({...scope, id: center.costCenterId, name: ' Financeiro '});
        expect(updated.costCenterName.name).toBe('Financeiro');
        expect(updated.costCenterOrganizationId).toBe(scope.organizationId);
        expect(updated.costCenterUnitId).toBe(scope.unitId);
        expect(updated.costCenterCode.code).toBe(input.code);
        expect(updated.costCenterCreatedAt).toEqual(center.costCenterCreatedAt);
    });

    it('does not persist a conflicting rename', async () => {
        await module.createCostCenter.execute(input);
        const second = await module.createCostCenter.execute({...input, code: 'CC-002', name: 'Financeiro'});
        await expect(module.updateCostCenter.execute({...scope, id: second.costCenterId, name: input.name})).rejects.toBeInstanceOf(CostCenterAlreadyExistsError);
        expect((await module.findByIdCostCenter.execute({...scope, id: second.costCenterId})).costCenterName.name).toBe('Financeiro');
        expect(await module.findAllCostCenters.execute(scope)).toHaveLength(2);
    });

    it('allows rename to a name used by another unit', async () => {
        await module.createCostCenter.execute({...input, unitId: 'unit-b'});
        const center = await module.createCostCenter.execute({...input, name: 'Financeiro'});
        expect((await module.updateCostCenter.execute({...scope, id: center.costCenterId, name: input.name})).costCenterName.name).toBe(input.name);
    });

    it('deletes and reports not found for all single-resource operations', async () => {
        const center = await module.createCostCenter.execute(input);
        const id = center.costCenterId;
        await module.deleteCostCenter.execute({...scope, id});
        for (const operation of [
            module.findByIdCostCenter.execute({...scope, id}),
            module.findByCodeCostCenter.execute({...scope, code: input.code}),
            module.findByNameCostCenter.execute({...scope, name: input.name}),
            module.updateCostCenter.execute({...scope, id, name: 'Financeiro'}),
            module.deleteCostCenter.execute({...scope, id}),
        ]) {
            await expect(operation).rejects.toBeInstanceOf(CostCenterNotFoundError);
        }
    });

    it('propagates unexpected persistence errors', async () => {
        const error = new Error('Database unavailable');
        vi.spyOn(persistence.costCenterRepository, 'create').mockRejectedValue(error);
        await expect(module.createCostCenter.execute(input)).rejects.toBe(error);
    });
});
