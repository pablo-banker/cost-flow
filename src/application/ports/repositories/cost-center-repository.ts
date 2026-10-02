import type {CostCenter} from '@domain/organization/entities/cost-center';

export interface CostCenterRepository {
    findAllByUnit(organizationId: string, unitId: string): Promise<CostCenter[]>;

    findById(organizationId: string, unitId: string, id: string): Promise<CostCenter>;

    findByName(organizationId: string, unitId: string, name: string): Promise<CostCenter>;

    findByCode(organizationId: string, unitId: string, code: string): Promise<CostCenter>;

    create(costCenter: CostCenter): Promise<void>;

    update(costCenter: CostCenter): Promise<void>;

    delete(organizationId: string, unitId: string, id: string): Promise<void>;
}
