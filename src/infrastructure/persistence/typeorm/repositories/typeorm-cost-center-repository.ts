import {QueryFailedError} from 'typeorm';
import type {Repository} from 'typeorm';

import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type {CostCenter} from '@domain/organization/entities/cost-center';

import type {CostCenterOrmEntity} from '@infrastructure/persistence/typeorm/entities/cost-center.orm-entity';
import {CostCenterMapper} from '@infrastructure/persistence/typeorm/mappers/cost-center-mapper';

export class TypeOrmCostCenterRepository implements CostCenterRepository {
    constructor(
        private readonly repository: Repository<CostCenterOrmEntity>,
    ) {}

    async findAllByUnit(organizationId: string, unitId: string): Promise<CostCenter[]> {
        const entities = await this.repository.find({
            where: {
                organizationId,
                unitId,
            },
        });

        return entities.map(CostCenterMapper.toDomain);
    }

    async findById(organizationId: string, unitId: string, id: string): Promise<CostCenter> {
        const entity = await this.repository.findOne({
            where: {
                organizationId,
                unitId,
                id,
            },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Cost center not found');
        }

        return CostCenterMapper.toDomain(entity);
    }

    async findByName(organizationId: string, unitId: string, name: string): Promise<CostCenter> {
        const entity = await this.repository.findOne({
            where: {
                organizationId,
                unitId,
                name,
            },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Cost center not found');
        }

        return CostCenterMapper.toDomain(entity);
    }

    async findByCode(organizationId: string, unitId: string, code: string): Promise<CostCenter> {
        const entity = await this.repository.findOne({
            where: {
                organizationId,
                unitId,
                code,
            },
        });

        if (!entity) {
            throw new PersistenceNotFoundError('Cost center not found');
        }

        return CostCenterMapper.toDomain(entity);
    }

    async create(costCenter: CostCenter): Promise<void> {
        const entity = CostCenterMapper.toPersistence(costCenter);

        try {
            await this.repository.insert(entity);
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async update(costCenter: CostCenter): Promise<void> {
        const entity = CostCenterMapper.toPersistence(costCenter);

        try {
            const result = await this.repository.update(
                {
                    id: entity.id,
                    organizationId: entity.organizationId,
                    unitId: entity.unitId,
                },
                {
                    name: entity.name,
                    updatedAt: entity.updatedAt,
                },
            );

            if (result.affected === 0) {
                throw new PersistenceNotFoundError('Cost center not found');
            }
        } catch (error) {
            this.handlePersistenceError(error);
        }
    }

    async delete(organizationId: string, unitId: string, id: string): Promise<void> {
        const result = await this.repository.delete({
            organizationId,
            unitId,
            id,
        });

        if (result.affected === 0) {
            throw new PersistenceNotFoundError('Cost center not found');
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
                throw new PersistenceConflictError('Cost center already exists');
            }
        }

        throw error;
    }
}
