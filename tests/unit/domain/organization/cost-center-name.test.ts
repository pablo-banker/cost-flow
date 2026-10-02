import {describe, expect, it} from 'vitest';

import {CostCenterName} from '@domain/organization/value-objects/cost-center-name';

describe('CostCenterName', () => {
    it('normalizes Unicode and accepts length boundaries', () => {
        expect(new CostCenterName(' cafe\u0301 ').name).toBe('café');
        expect(new CostCenterName('ABC').name).toHaveLength(3);
        expect(new CostCenterName('A'.repeat(150)).name).toHaveLength(150);
    });
    it('should create a valid costCenter name', () => {
        const name = 'Matriz Florianópolis';

        const costCenterName = new CostCenterName(name);

        expect(costCenterName.name).toBe(name);
    });

    it('should trim costCenter name', () => {
        const costCenterName = new CostCenterName('   Matriz Florianópolis   ');

        expect(costCenterName.name).toBe('Matriz Florianópolis');
    });

    it('should reject empty name', () => {
        expect(() => new CostCenterName(''))
            .toThrow('Cost center name cannot be empty');
    });

    it('should reject only whitespace name', () => {
        expect(() => new CostCenterName('       '))
            .toThrow('Cost center name cannot be empty');
    });

    it('should reject name shorter than 3 characters', () => {
        expect(() => new CostCenterName('AB'))
            .toThrow('Cost center name must be longer than 2 characters');
    });

    it('should reject name longer than 150 characters', () => {
        expect(() => new CostCenterName('A'.repeat(151)))
            .toThrow('Cost center name cannot be longer than 150 characters');
    });

    it('equals should return true for same name', () => {
        const firstName = new CostCenterName('Matriz');
        const secondName = new CostCenterName('Matriz');

        expect(firstName.equals(secondName)).toBe(true);
    });

    it('equals should return false for different names', () => {
        const firstName = new CostCenterName('Matriz');
        const secondName = new CostCenterName('Filial');

        expect(firstName.equals(secondName)).toBe(false);
    });
});
