import  {OrganizationName} from "@domain/organization/value-objects/organization-name";

export class Organization {
    constructor(
        private readonly id: string,
        private name: OrganizationName,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    get organizationId(): string {
        return this.id;
    }

    get organizationName(): OrganizationName {
        return this.name;
    }

    get organizationCreatedAt(): Date {
        return this.createdAt;
    }

    get organizationUpdatedAt(): Date {
        return this.updatedAt;
    }

    rename(newName: string): void {
        const organizationName = new OrganizationName(newName);
        if (this.name.equals(organizationName)) {
            return
        }

        this.name = new OrganizationName(newName);
        this.updatedAt = new Date();
    }
}