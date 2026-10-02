import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';

export class CostCenter {
    constructor(
        private readonly id: string,
        private readonly organizationId: string,
        private readonly unitId: string,
        private readonly code: CostCenterCode,
        private name: CostCenterName,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    get costCenterId(): string {
        return this.id;
    }

    get costCenterOrganizationId(): string {
        return this.organizationId;
    }

    get costCenterName(): CostCenterName {
        return this.name;
    }

    get costCenterCreatedAt(): Date {
        return this.createdAt;
    }

    get costCenterUpdatedAt(): Date {
        return this.updatedAt;
    }

    get costCenterUnitId(): string {
        return this.unitId;
    }

    get costCenterCode(): CostCenterCode {
        return this.code;
    }

    rename(newName: string): void {
        const costCenterName = new CostCenterName(newName);

        if (this.name.equals(costCenterName)) {
            return;
        }

        this.name = costCenterName;
        this.updatedAt = new Date();
    }
}
