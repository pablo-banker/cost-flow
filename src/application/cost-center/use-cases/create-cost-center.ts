import {randomUUID} from 'node:crypto';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    CostCenterAlreadyExistsError,
} from '@application/cost-center/errors';

import type {OrganizationRepository} from '@application/ports/repositories/organization-repository';
import {UnitNotFoundError} from '@application/unit/errors';
import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import type {CostCenterRepository} from '@application/ports/repositories/cost-center-repository';

import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import {CostCenter} from '@domain/organization/entities/cost-center';
import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';

export type CreateCostCenterInput = {
    organizationId: string;
    unitId: string;
    code: string;
    name: string;
};

export class CreateCostCenter {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly unitRepository: UnitRepository,
        private readonly costCenterRepository: CostCenterRepository,
    ) {}

    async execute(input: CreateCostCenterInput): Promise<CostCenter> {
        await this.ensureOrganizationExists(input.organizationId);

        try {
            await this.unitRepository.findById(input.organizationId, input.unitId);
        } catch (error) {
            if (error instanceof PersistenceNotFoundError) {
                throw new UnitNotFoundError();
            }
            throw error;
        }

        const costCenter = this.prepare(input);

        try {
            await this.costCenterRepository.create(costCenter);
        } catch (error) {
            this.handlePersistenceError(error);
        }

        return costCenter;
    }

    private async ensureOrganizationExists(organizationId: string): Promise<void> {
        try {
            await this.organizationRepository.findById(organizationId);
        } catch (error) {
            if (error instanceof PersistenceNotFoundError) {
                throw new OrganizationNotFoundError();
            }

            throw error;
        }
    }

    private prepare(input: CreateCostCenterInput): CostCenter {
        const costCenterName = new CostCenterName(input.name);
        const now = new Date();

        return new CostCenter(
            randomUUID(),
            input.organizationId,
            input.unitId,
            new CostCenterCode(input.code),
            costCenterName,
            now,
            now,
        );
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceConflictError) {
            throw new CostCenterAlreadyExistsError();
        }

        throw error;
    }
}
