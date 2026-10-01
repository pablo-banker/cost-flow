import {QueryFailedError} from 'typeorm';
import type {Repository} from 'typeorm';

import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type {Unit} from '@domain/organization/entities/unit';

import type {UnitOrmEntity} from '@infrastructure/persistence/typeorm/entities/unit.orm-entity';
import {UnitMapper} from '@infrastructure/persistence/typeorm/mappers/unit-mapper';

export class TypeOrmUnitRepository implements UnitRepository {
    constructor(
        private readonly repository: Repository<UnitOrmEntity>,
    ) {}

    async findAllByOrganizationId(organizationId: string): Promise<Unit[]> {
        const entities = await this.repository.find({
            where: {
                organizationId,
            },
        });

        return entities.map(UnitMapper.toDomain);
    }

    async findById(organizationId: string, id: string): Promise<Unit> {
        const entity = await this.repository.findOne({
            where: {
                organizationId,
                id,
            },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        return UnitMapper.toDomain(entity);
    }

    async findByName(organizationId: string, name: string): Promise<Unit> {
        const entity = await this.repository.findOne({
            where: {
                organizationId,
                name,
            },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        return UnitMapper.toDomain(entity);
    }

    async create(unit: Unit): Promise<void> {
        const entity = UnitMapper.toPersistence(unit);

        try {
            await this.repository.insert(entity);
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async update(unit: Unit): Promise<void> {
        const entity = UnitMapper.toPersistence(unit);

        try {
            const result = await this.repository.update(
                {
                    id: entity.id,
                    organizationId: entity.organizationId,
                },
                {
                    name: entity.name,
                    createdAt: entity.createdAt,
                    updatedAt: entity.updatedAt,
                },
            );

            if (result.affected === 0) {
                throw new PersistenceNotFoundError('Unit not found');
            }
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async delete(organizationId: string, id: string): Promise<void> {
        const result = await this.repository.delete({
            organizationId,
            id,
        });

        if (result.affected === 0) {
            throw new PersistenceNotFoundError('Unit not found');
        }
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceNotFoundError) {
            throw error;
        }

        if (error instanceof QueryFailedError) {
            const driverError = error.driverError as {
                code?: string;
            };

            if (driverError.code === '23505') {
                throw new PersistenceConflictError('Unit already exists');
            }
        }

        throw error;
    }
}