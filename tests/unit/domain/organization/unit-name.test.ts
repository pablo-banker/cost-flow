import {describe, expect, it} from 'vitest';

import {UnitName} from '@domain/organization/value-objects/unit-name';

describe('UnitName', () => {
    it('should create a valid unit name', () => {
        const name = 'Matriz Florianópolis';

        const unitName = new UnitName(name);

        expect(unitName.name).toBe(name);
    });

    it('should trim unit name', () => {
        const unitName = new UnitName('   Matriz Florianópolis   ');

        expect(unitName.name).toBe('Matriz Florianópolis');
    });

    it('should reject empty name', () => {
        expect(() => new UnitName(''))
            .toThrow('Unit name cannot be empty');
    });

    it('should reject only whitespace name', () => {
        expect(() => new UnitName('       '))
            .toThrow('Unit name cannot be empty');
    });

    it('should reject name shorter than 3 characters', () => {
        expect(() => new UnitName('AB'))
            .toThrow('Unit name must be longer than 2 characters');
    });

    it('should reject name longer than 150 characters', () => {
        expect(() => new UnitName('A'.repeat(151)))
            .toThrow('Unit name cannot be longer than 150 characters');
    });

    it('equals should return true for same name', () => {
        const firstName = new UnitName('Matriz');
        const secondName = new UnitName('Matriz');

        expect(firstName.equals(secondName)).toBe(true);
    });

    it('equals should return false for different names', () => {
        const firstName = new UnitName('Matriz');
        const secondName = new UnitName('Filial');

        expect(firstName.equals(secondName)).toBe(false);
    });
});