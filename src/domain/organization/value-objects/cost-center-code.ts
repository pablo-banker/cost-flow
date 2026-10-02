import {
    CostCenterCodeRequiredError,
    CostCenterCodeTooLongError,
} from '@domain/organization/errors';

export class CostCenterCode {
    private readonly value: string;

    constructor(value: string) {
        const normalizedValue = value.trim().normalize();

        if (normalizedValue === '') {
            throw new CostCenterCodeRequiredError();
        }

        if (normalizedValue.length > 50) {
            throw new CostCenterCodeTooLongError();
        }

        this.value = normalizedValue;
    }

    get code(): string {
        return this.value;
    }

    equals(other: CostCenterCode): boolean {
        return this.value === other.value;
    }
}
