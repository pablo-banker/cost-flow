import {
    UnitNameRequiredError,
    UnitNameTooLongError,
    UnitNameTooShortError,
} from '@domain/organization/errors';

export class UnitName {
    private readonly value: string;

    constructor(value: string) {
        const normalizedValue = value.trim().normalize();

        if (normalizedValue === '') {
            throw new UnitNameRequiredError();
        }

        if (normalizedValue.length <= 2) {
            throw new UnitNameTooShortError();
        }

        if (normalizedValue.length > 150) {
            throw new UnitNameTooLongError();
        }

        this.value = normalizedValue;
    }

    get name(): string {
        return this.value;
    }

    equals(other: UnitName): boolean {
        return this.value === other.value;
    }
}