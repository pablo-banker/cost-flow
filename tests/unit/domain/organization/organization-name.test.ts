import { describe, expect, it } from 'vitest';
import {OrganizationName} from "@domain/organization/value-objects/organization-name";

describe('OrganizationName', () => {
    it('create valid name', () => {
        // Arrange
        const validName = 'Valid Organization Name'
        const organizationName = new OrganizationName(validName)

        // Assert
        expect(organizationName.name).
            toBe(validName)
    })

    it('should trim organization name', () => {
        // Arrange
        const nameWithWhitespace = '  Valid Organization Name  '
        const organizationName = new OrganizationName(nameWithWhitespace)

        // Assert
        expect(organizationName.name).
            toBe('Valid Organization Name')
    })

    it('reject empty name', () => {
        // Arrange
        const emptyName = ''

        // Assert
        expect(() => new OrganizationName(emptyName)).
            toThrow('Organization name cannot be empty')
    })

    it('reject only whitespace name', () => {
        // Arrange
        const whitespaceName = '   '

        // Assert
        expect(() => new OrganizationName(whitespaceName)).
            toThrow('Organization name cannot be empty')
    })

    it('reject name longer than 150 characters', () => {
        // Arrange
        const longName = 'a'.repeat(151)

        // Assert
        expect(() => new OrganizationName(longName)).
            toThrow('Organization name cannot be longer than 150 characters')
    })

    it ('equals method returns true for same name', () => {
        // Arrange
        const name1 = new OrganizationName('Same Name')
        const name2 = new OrganizationName('Same Name')

        // Assert
        expect(name1.equals(name2)).
            toBe(true)
    })

    it('equals method returns false for different names', () => {
        // Arrange
        const name1 = new OrganizationName('Name One')
        const name2 = new OrganizationName('Name Two')

        // Assert
        expect(name1.equals(name2)).
            toBe(false)
    })
})