import {UnitName} from '@domain/organization/value-objects/unit-name';

export class Unit {
    constructor(
        private readonly id: string,
        private readonly organizationId: string,
        private name: UnitName,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    get unitId(): string {
        return this.id;
    }

    get unitOrganizationId(): string {
        return this.organizationId;
    }

    get unitName(): UnitName {
        return this.name;
    }

    get unitCreatedAt(): Date {
        return this.createdAt;
    }

    get unitUpdatedAt(): Date {
        return this.updatedAt;
    }

    rename(newName: string): void {
        const unitName = new UnitName(newName);

        if (this.name.equals(unitName)) {
            return;
        }

        this.name = unitName;
        this.updatedAt = new Date();
    }
}