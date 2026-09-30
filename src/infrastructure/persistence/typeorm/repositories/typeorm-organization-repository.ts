import { QueryFailedError } from 'typeorm';
import type { Repository } from 'typeorm';

import type { OrganizationRepository } from '@application/ports/repositories/organization-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type { Organization } from '@domain/organization/entities/organization';

import type { OrganizationOrmEntity } from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { OrganizationMapper } from '@infrastructure/persistence/typeorm/mappers/organization-mapper';

export class TypeOrmOrganizationRepository implements OrganizationRepository
{
    constructor(
        private readonly repository: Repository<OrganizationOrmEntity>,
    ) {}

    async findAll(): Promise<Organization[]> {
        const entities = await this.repository.find();

        return entities.map(OrganizationMapper.toDomain);
    }

    async findById(id: string): Promise<Organization> {
        const entity = await this.repository.findOne({
            where: { id },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Organization not found');
        }

        return OrganizationMapper.toDomain(entity);
    }

    async findByName(name: string): Promise<Organization> {
        const entity = await this.repository.findOne({
            where: { name },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Organization not found');
        }

        return OrganizationMapper.toDomain(entity);
    }

    async create(organization: Organization): Promise<void> {
        const entity = OrganizationMapper.toPersistence(organization);

        try {
            await this.repository.insert(entity);
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async update(organization: Organization): Promise<void> {
        const entity = OrganizationMapper.toPersistence(organization);

        try {
            const result = await this.repository.update(
                entity.id,
                {
                    name: entity.name,
                    createdAt: entity.createdAt,
                    updatedAt: entity.updatedAt,
                },
            );

            if (result.affected === 0) {
                throw new PersistenceNotFoundError('Organization not found');
            }
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async delete(id: string): Promise<void> {
        const result =
            await this.repository.delete(id);

        if (result.affected === 0) {
            throw new PersistenceNotFoundError('Organization not found');
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw error;
        }

        if (error instanceof QueryFailedError) {
            const driverError =
                error.driverError as {
                    code?: string;
                };

            if (driverError.code === '23505') {
                throw new PersistenceConflictError('Organization already exists');
            }
        }

        throw error;
    }
}