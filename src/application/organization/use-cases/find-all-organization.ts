import type {Organization} from "@domain/organization/entities/organization";
import type {OrganizationRepository} from "@application/ports/repositories/organization-repository";

export type FindAllOrganizationOutput = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export class FindAllOrganization {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) {}

    async execute(): Promise<FindAllOrganizationOutput[]> {
        const organizations =
            await this.organizationRepository.findAll();

        return this.formalize(organizations);
    }

    private formalize(organizations: Organization[]): FindAllOrganizationOutput[] {
        return organizations.map((organization) => ({
            id: organization.organizationId,
            name: organization.organizationName.name,
            createdAt: organization.organizationCreatedAt,
            updatedAt: organization.organizationUpdatedAt,
        }));
    }
}