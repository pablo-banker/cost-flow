import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {CostCenter} from '@domain/organization/entities/cost-center';
import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';

import type {CostCenterOrmEntity} from '@infrastructure/persistence/typeorm/entities/cost-center.orm-entity';

export class CostCenterMapper {
    static toDomain(entity: CostCenterOrmEntity): CostCenter {
        return new CostCenter(
            entity.id,
            entity.organizationId,
            entity.unitId,
            new CostCenterCode(entity.code),
            new CostCenterName(entity.name),
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toPersistence(costCenter: CostCenter): CostCenterOrmEntity {
        return {
            id: costCenter.costCenterId,
            organizationId: costCenter.costCenterOrganizationId,
            unitId: costCenter.costCenterUnitId,
            code: costCenter.costCenterCode.code,
            name: costCenter.costCenterName.name,
            createdAt: costCenter.costCenterCreatedAt,
            updatedAt: costCenter.costCenterUpdatedAt,
        };
    }
}
