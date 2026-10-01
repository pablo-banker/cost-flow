import {randomUUID} from 'node:crypto';

import {
    OrganizationNotFoundError,
} from '@application/organization/errors';

import {
    UnitAlreadyExistsError,
} from '@application/unit/errors';

import type {OrganizationRepository} from '@application/ports/repositories/organization-repository';
import type {UnitRepository} from '@application/ports/repositories/unit-repository';

import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';

export type CreateUnitInput = {
    organizationId: string;
    name: string;
};

export class CreateUnit {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly unitRepository: UnitRepository,
    ) {}

    async execute(input: CreateUnitInput): Promise<Unit> {
        await this.ensureOrganizationExists(input.organizationId);

        const unit = this.prepare(input);

        try {
            await this.unitRepository.create(unit);
        } catch (error) {
            this.handlePersistenceError(error);
        }

        return unit;
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

    private prepare(input: CreateUnitInput): Unit {
        const unitName = new UnitName(input.name);
        const now = new Date();

        return new Unit(
            randomUUID(),
            input.organizationId,
            unitName,
            now,
            now,
        );
    }

    private handlePersistenceError(error: unknown): never {
        if (error instanceof PersistenceConflictError) {
            throw new UnitAlreadyExistsError();
        }

        throw error;
    }
}