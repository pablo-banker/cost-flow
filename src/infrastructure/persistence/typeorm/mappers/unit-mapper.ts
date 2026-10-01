import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

import type {UnitOrmEntity} from '@infrastructure/persistence/typeorm/entities/unit.orm-entity';

export class UnitMapper {
    static toDomain(entity: UnitOrmEntity): Unit {
        return new Unit(
            entity.id,
            entity.organizationId,
            new UnitName(entity.name),
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toPersistence(unit: Unit): UnitOrmEntity {
        return {
            id: unit.unitId,
            organizationId: unit.unitOrganizationId,
            name: unit.unitName.name,
            createdAt: unit.unitCreatedAt,
            updatedAt: unit.unitUpdatedAt,
        };
    }
}