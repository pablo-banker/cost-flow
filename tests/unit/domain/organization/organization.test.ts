import {describe, expect, it} from "vitest";
import {Organization} from "@domain/organization/entities/organization";
import {OrganizationName} from "@domain/organization/value-objects/organization-name";

describe('Organization', () => {
    it('should create a valid organization', () => {
        // Arrange
        const id = 'org-123';
        const name = 'Valid Organization Name';
        const createdAt = new Date();
        const updatedAt = new Date();

        // Act
        const organization = new Organization(id, new OrganizationName(name), createdAt, updatedAt);

        // Assert
        expect(organization.organizationId).toBe(id);
        expect(organization.organizationName.name).toBe(name);
        expect(organization.organizationCreatedAt).toBe(createdAt);
        expect(organization.organizationUpdatedAt).toBe(updatedAt);
    })


    it('should rename organization', () => {
        // Arrange
        const id = 'org-123';
        const name = 'Valid Organization Name';
        const createdAt = new Date();
        const updatedAt = new Date('2026-01-01T00:00:00Z');
        const organization = new Organization(id, new OrganizationName(name), createdAt, updatedAt);

        // Act
        const newName = 'New Organization Name';
        organization.rename(newName);

        // Assert
        expect(organization.organizationName.name).
            toBe(newName);
    })

    it('should update updatedAt when renaming organization', () => {
        // Arrange
        const id = 'org-123';
        const name = 'Valid Organization Name';
        const createdAt = new Date();
        const updatedAt = new Date('2026-01-01T00:00:00Z');
        const organization = new Organization(id, new OrganizationName(name), createdAt, updatedAt);

        // Act
        const newName = 'New Organization Name';
        organization.rename(newName);

        // Assert
        expect(organization.organizationUpdatedAt.getTime()).
            toBeGreaterThan(updatedAt.getTime());
    })

    it('should not update when renaming to the same name', () => {
        const updatedAt = new Date('2026-01-01T00:00:00Z')

        const organization = new Organization(
            'org-123',
            new OrganizationName('Valid Organization Name'),
            new Date('2026-01-01T00:00:00Z'),
            updatedAt,
        )

        organization.rename('Valid Organization Name')

        expect(organization.organizationUpdatedAt).toBe(updatedAt)
    })

    it('should reject invalid new name when renaming organization', () => {
        // Arrange
        const id = 'org-123';
        const name = 'Valid Organization Name';
        const createdAt = new Date();
        const updatedAt = new Date();
        const organization = new Organization(id, new OrganizationName(name), createdAt, updatedAt);

        // Act & Assert
        expect(() => organization.rename('')).
            toThrow('Organization name cannot be empty');
    })
})
