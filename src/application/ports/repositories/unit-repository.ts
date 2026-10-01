import type {Unit} from '@domain/organization/entities/unit';

export interface UnitRepository {
    findAllByOrganizationId(organizationId: string): Promise<Unit[]>;

    findById(organizationId: string, id: string): Promise<Unit>;

    findByName(organizationId: string, name: string): Promise<Unit>;

    create(unit: Unit): Promise<void>;

    update(unit: Unit): Promise<void>;

    delete(organizationId: string, id: string): Promise<void>;
}