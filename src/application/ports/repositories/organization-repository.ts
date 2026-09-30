import type {Organization} from "@domain/organization/entities/organization";

export interface OrganizationRepository {
    findAll(): Promise<Organization[]>;

    findById(id: string): Promise<Organization>;

    findByName(name: string): Promise<Organization>;

    create(organization: Organization): Promise<void>;

    update(organization: Organization): Promise<void>;

    delete(id: string): Promise<void>;
}