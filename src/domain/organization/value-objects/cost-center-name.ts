import {
    CostCenterNameRequiredError,
    CostCenterNameTooLongError,
    CostCenterNameTooShortError,
} from '@domain/organization/errors';

export class CostCenterName {
    private readonly value: string;

    constructor(value: string) {
        const normalizedValue = value.trim().normalize();

        if (normalizedValue === '') {
            throw new CostCenterNameRequiredError();
        }

        if (normalizedValue.length <= 2) {
            throw new CostCenterNameTooShortError();
        }

        if (normalizedValue.length > 150) {
            throw new CostCenterNameTooLongError();
        }

        this.value = normalizedValue;
    }

    get name(): string {
        return this.value;
    }

    equals(other: CostCenterName): boolean {
        return this.value === other.value;
    }
}
