import {describe, expect, it, beforeEach} from "vitest";
import {CreateOrganization, type CreateOrganizationInput} from "@application/organization/use-cases/create-organization";
import {InMemoryOrganizationRepository} from "@infrastructure/persistence/memory/repositories/in-memory-organization-repository";
import {OrganizationAlreadyExistsError} from "@application/organization/errors";
import {OrganizationNameRequiredError, OrganizationNameTooLongError} from "@domain/organization/errors";

describe('CreateOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();
        createOrganization = new CreateOrganization(repository);
    });

    it('should create a valid organization', async () => {
        const input: CreateOrganizationInput = {
            name: 'Valid Organization Name',
        };

        const organization = await createOrganization.execute(input);

        expect(organization.organizationId).toBeDefined();
        expect(organization.organizationName.name).toBe(input.name);
        expect(organization.organizationCreatedAt).toBeInstanceOf(Date);
        expect(organization.organizationUpdatedAt).toBeInstanceOf(Date);

        const savedOrganization = await repository.findById(
            organization.organizationId,
        );

        expect(savedOrganization).not.toBeNull();
        expect(savedOrganization?.organizationId)
            .toBe(organization.organizationId);
        expect(savedOrganization?.organizationName.name)
            .toBe(input.name);
    });

    it('should normalize the organization name before creating it', async () => {
        const organization = await createOrganization.execute({
            name: '   CostFlow   ',
        });

        expect(organization.organizationName.name).toBe('CostFlow');
    });

    it('should fail when organization name is empty', async () => {
        await expect(
            createOrganization.execute({
                name: '',
            }),
        ).rejects.toBeInstanceOf(OrganizationNameRequiredError);
    });

    it('should fail when organization name contains only whitespace', async () => {
        await expect(
            createOrganization.execute({
                name: '       ',
            }),
        ).rejects.toBeInstanceOf(OrganizationNameRequiredError);
    });

    it('should fail when organization name is longer than 150 characters', async () => {
        await expect(
            createOrganization.execute({
                name: 'A'.repeat(151),
            }),
        ).rejects.toBeInstanceOf(OrganizationNameTooLongError);
    });

    it('should fail when an organization with the same name already exists', async () => {
        await createOrganization.execute({
            name: 'CostFlow',
        });

        await expect(
            createOrganization.execute({
                name: 'CostFlow',
            }),
        ).rejects.toBeInstanceOf(OrganizationAlreadyExistsError);
    });

    it('should detect duplicated names after normalization', async () => {
        await createOrganization.execute({
            name: 'CostFlow',
        });

        await expect(
            createOrganization.execute({
                name: '   CostFlow   ',
            }),
        ).rejects.toBeInstanceOf(OrganizationAlreadyExistsError);
    });
});