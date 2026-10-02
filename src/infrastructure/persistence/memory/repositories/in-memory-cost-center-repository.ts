import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {PersistenceConflictError, PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';
import {CostCenter} from '@domain/organization/entities/cost-center';

export class InMemoryCostCenterRepository implements CostCenterRepository {
    private costCenters: CostCenter[] = [];

    async findAllByUnit(organizationId: string, unitId: string): Promise<CostCenter[]> {
        return this.costCenters.filter(center =>
            center.costCenterOrganizationId === organizationId && center.costCenterUnitId === unitId,
        ).map(center => this.copy(center));
    }

    async findById(organizationId: string, unitId: string, id: string): Promise<CostCenter> {
        return this.find(organizationId, unitId, center => center.costCenterId === id);
    }

    async findByName(organizationId: string, unitId: string, name: string): Promise<CostCenter> {
        return this.find(organizationId, unitId, center => center.costCenterName.name === name);
    }

    async findByCode(organizationId: string, unitId: string, code: string): Promise<CostCenter> {
        return this.find(organizationId, unitId, center => center.costCenterCode.code === code);
    }

    async create(costCenter: CostCenter): Promise<void> {
        if (this.costCenters.some(center => center.costCenterId === costCenter.costCenterId)) {
            throw new PersistenceConflictError('Cost center already exists');
        }
        this.ensureUnique(costCenter);
        this.costCenters.push(this.copy(costCenter));
    }

    async update(costCenter: CostCenter): Promise<void> {
        const index = this.costCenters.findIndex(center =>
            center.costCenterOrganizationId === costCenter.costCenterOrganizationId &&
            center.costCenterUnitId === costCenter.costCenterUnitId &&
            center.costCenterId === costCenter.costCenterId,
        );
        const existing = this.costCenters[index];
        if (!existing) {
            throw new PersistenceNotFoundError('Cost center not found');
        }
        const updated = new CostCenter(
            existing.costCenterId, existing.costCenterOrganizationId, existing.costCenterUnitId,
            existing.costCenterCode, costCenter.costCenterName, existing.costCenterCreatedAt,
            costCenter.costCenterUpdatedAt,
        );
        this.ensureUnique(updated);
        this.costCenters[index] = this.copy(updated);
    }

    async delete(organizationId: string, unitId: string, id: string): Promise<void> {
        await this.findById(organizationId, unitId, id);
        this.costCenters = this.costCenters.filter(center => center.costCenterId !== id);
    }

    private find(organizationId: string, unitId: string, matches: (center: CostCenter) => boolean): CostCenter {
        const center = this.costCenters.find(center =>
            center.costCenterOrganizationId === organizationId && center.costCenterUnitId === unitId && matches(center),
        );
        if (!center) {
            throw new PersistenceNotFoundError('Cost center not found');
        }
        return this.copy(center);
    }

    private ensureUnique(costCenter: CostCenter): void {
        const conflict = this.costCenters.some(center =>
            center.costCenterId !== costCenter.costCenterId &&
            center.costCenterOrganizationId === costCenter.costCenterOrganizationId &&
            center.costCenterUnitId === costCenter.costCenterUnitId &&
            (center.costCenterCode.equals(costCenter.costCenterCode) || center.costCenterName.equals(costCenter.costCenterName)),
        );
        if (conflict) {
            throw new PersistenceConflictError('Cost center already exists');
        }
    }

    private copy(center: CostCenter): CostCenter {
        return new CostCenter(
            center.costCenterId, center.costCenterOrganizationId, center.costCenterUnitId,
            center.costCenterCode, center.costCenterName,
            new Date(center.costCenterCreatedAt), new Date(center.costCenterUpdatedAt),
        );
    }
}
