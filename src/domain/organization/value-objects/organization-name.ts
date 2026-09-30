import {
    OrganizationNameRequiredError,
    OrganizationNameTooLongError,
    OrganizationNameTooShortError
} from "@domain/organization/errors";

export class OrganizationName {
    private readonly value: string;

    constructor(value: string) {
        const normalizedValue = value.trim().normalize();

        if (normalizedValue === '') {
            throw new OrganizationNameRequiredError();
        }

        if (normalizedValue.length <= 2) {
            throw new OrganizationNameTooShortError();
        }

        if (normalizedValue.length > 150) {
            throw new OrganizationNameTooLongError();
        }

        this.value = normalizedValue;
    }

    get name(): string {
        return this.value;
    }

    equals(other: OrganizationName): boolean {
        return this.value === other.value;
    }
}