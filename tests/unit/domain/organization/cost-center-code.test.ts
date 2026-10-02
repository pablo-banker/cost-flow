import {describe, expect, it} from 'vitest';
import {CostCenterCode} from '@domain/organization/value-objects/cost-center-code';
import {CostCenterCodeRequiredError, CostCenterCodeTooLongError} from '@domain/organization/errors';

describe('CostCenterCode', () => {
    it('trims and normalizes Unicode', () => {
        expect(new CostCenterCode('  cafe\u0301  ').code).toBe('café');
    });
    it.each(['', '   '])('rejects empty code %j', code => {
        expect(() => new CostCenterCode(code)).toThrow(CostCenterCodeRequiredError);
    });
    it('accepts one and 50 characters', () => {
        expect(new CostCenterCode('A').code).toBe('A');
        expect(new CostCenterCode('A'.repeat(50)).code).toHaveLength(50);
    });
    it('rejects 51 characters', () => {
        expect(() => new CostCenterCode('A'.repeat(51))).toThrow(CostCenterCodeTooLongError);
    });
    it('compares normalized values', () => {
        expect(new CostCenterCode(' CC-001 ').equals(new CostCenterCode('CC-001'))).toBe(true);
        expect(new CostCenterCode('CC-001').equals(new CostCenterCode('CC-002'))).toBe(false);
    });
});
