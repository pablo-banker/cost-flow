import type {UnitRepository} from '@application/ports/repositories/unit-repository';
import {
    PersistenceConflictError,
    PersistenceNotFoundError,
} from '@application/ports/repositories/persistence-errors';

import type {Unit} from '@domain/organization/entities/unit';

export class InMemoryUnitRepository implements UnitRepository {
    private units: Unit[] = [];

    async findAllByOrganizationId(organizationId: string): Promise<Unit[]> {
        return this.units.filter(
            unit => unit.unitOrganizationId === organizationId,
        );
    }

    async findById(organizationId: string, id: string): Promise<Unit> {
        const unit = this.units.find(
            unit =>
                unit.unitOrganizationId === organizationId &&
                unit.unitId === id,
        );

        if (!unit) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        return unit;
    }

    async findByName(organizationId: string, name: string): Promise<Unit> {
        const unit = this.units.find(
            unit =>
                unit.unitOrganizationId === organizationId &&
                unit.unitName.name === name,
        );

        if (!unit) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        return unit;
    }

    async create(unit: Unit): Promise<void> {
        const alreadyExists = this.units.some(
            existingUnit =>
                existingUnit.unitOrganizationId === unit.unitOrganizationId &&
                (
                    existingUnit.unitId === unit.unitId ||
                    existingUnit.unitName.name === unit.unitName.name
                ),
        );

        if (alreadyExists) {
            throw new PersistenceConflictError('Unit already exists');
        }

        this.units.push(unit);
    }

    async update(unit: Unit): Promise<void> {
        const index = this.units.findIndex(
            existingUnit =>
                existingUnit.unitOrganizationId === unit.unitOrganizationId &&
                existingUnit.unitId === unit.unitId,
        );

        if (index === -1) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        const nameConflict = this.units.some(
            (existingUnit, existingIndex) =>
                existingIndex !== index &&
                existingUnit.unitOrganizationId === unit.unitOrganizationId &&
                existingUnit.unitName.name === unit.unitName.name,
        );

        if (nameConflict) {
            throw new PersistenceConflictError('Unit already exists');
        }

        this.units[index] = unit;
    }

    async delete(organizationId: string, id: string): Promise<void> {
        const index = this.units.findIndex(
            unit =>
                unit.unitOrganizationId === organizationId &&
                unit.unitId === id,
        );

        if (index === -1) {
            throw new PersistenceNotFoundError('Unit not found');
        }

        this.units.splice(index, 1);
    }
}