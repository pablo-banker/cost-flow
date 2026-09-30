import { Organization } from '@domain/organization/entities/organization';
import { OrganizationName } from '@domain/organization/value-objects/organization-name';

import { OrganizationOrmEntity } from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';

export class OrganizationMapper {
    static toDomain(entity: OrganizationOrmEntity): Organization {
        return new Organization(
            entity.id,
            new OrganizationName(entity.name),
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toPersistence(organization: Organization): OrganizationOrmEntity {
        const entity = new OrganizationOrmEntity();

        entity.id = organization.organizationId;
        entity.name = organization.organizationName.name;
        entity.createdAt = organization.organizationCreatedAt;
        entity.updatedAt = organization.organizationUpdatedAt;

        return entity;
    }
}