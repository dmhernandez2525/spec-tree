import { describe, it, expect } from 'vitest';
import {
  evaluatePasswordStrength,
  getStrengthColor,
  getStrengthText,
  getStrengthPercentage,
} from './password-strength';

describe('password-strength', () => {
  describe('evaluatePasswordStrength', () => {
    describe('very-weak passwords', () => {
      it('returns very-weak for empty string', () => {
        expect(evaluatePasswordStrength('')).toBe('very-weak');
      });

      it('returns very-weak for passwords less than 8 characters', () => {
        expect(evaluatePasswordStrength('Short1!')).toBe('very-weak');
        expect(evaluatePasswordStrength('abc')).toBe('very-weak');
        expect(evaluatePasswordStrength('1234567')).toBe('very-weak');
      });
    });

    describe('weak passwords', () => {
      it('returns weak for password with only lowercase', () => {
        expect(evaluatePasswordStrength('abcdefgh')).toBe('weak');
      });

      it('returns weak for password with only uppercase', () => {
        expect(evaluatePasswordStrength('ABCDEFGH')).toBe('weak');
      });

      it('returns weak for password with only digits', () => {
        expect(evaluatePasswordStrength('12345678')).toBe('weak');
      });

      it('returns weak for password with two types', () => {
        expect(evaluatePasswordStrength('Abcdefgh')).toBe('weak');
        expect(evaluatePasswordStrength('abcd1234')).toBe('weak');
      });
    });

    describe('medium passwords', () => {
      it('returns medium for password with three types', () => {
        expect(evaluatePasswordStrength('Abcdef12')).toBe('medium');
        expect(evaluatePasswordStrength('ABC123gh')).toBe('medium');
        expect(evaluatePasswordStrength('abc@1234')).toBe('medium');
      });
    });

    describe('strong passwords', () => {
      it('returns strong for password with all four types', () => {
        expect(evaluatePasswordStrength('Abcdef1!')).toBe('strong');
        expect(evaluatePasswordStrength('Test@123')).toBe('strong');
        expect(evaluatePasswordStrength('MyP@ssw0rd')).toBe('strong');
      });

      it('returns strong for complex passwords', () => {
        expect(evaluatePasswordStrength('V3ry$tr0ng!')).toBe('strong');
        expect(evaluatePasswordStrength('Complex@Password123')).toBe('strong');
      });
    });
  });

  describe('getStrengthColor', () => {
    it('returns bg-red-500 for very-weak', () => {
      expect(getStrengthColor('very-weak')).toBe('bg-red-500');
    });

    it('returns bg-orange-500 for weak', () => {
      expect(getStrengthColor('weak')).toBe('bg-orange-500');
    });

    it('returns bg-yellow-500 for medium', () => {
      expect(getStrengthColor('medium')).toBe('bg-yellow-500');
    });

    it('returns bg-green-500 for strong', () => {
      expect(getStrengthColor('strong')).toBe('bg-green-500');
    });
  });

  describe('getStrengthText', () => {
    it('returns "Very Weak" for very-weak', () => {
      expect(getStrengthText('very-weak')).toBe('Very Weak');
    });

    it('returns "Weak" for weak', () => {
      expect(getStrengthText('weak')).toBe('Weak');
    });

    it('returns "Medium" for medium', () => {
      expect(getStrengthText('medium')).toBe('Medium');
    });

    it('returns "Strong" for strong', () => {
      expect(getStrengthText('strong')).toBe('Strong');
    });
  });

  describe('getStrengthPercentage', () => {
    it('returns 25 for very-weak', () => {
      expect(getStrengthPercentage('very-weak')).toBe(25);
    });

    it('returns 50 for weak', () => {
      expect(getStrengthPercentage('weak')).toBe(50);
    });

    it('returns 75 for medium', () => {
      expect(getStrengthPercentage('medium')).toBe(75);
    });

    it('returns 100 for strong', () => {
      expect(getStrengthPercentage('strong')).toBe(100);
    });
  });

  describe('integration tests', () => {
    it('calculates correct values for a very-weak password', () => {
      const password = 'abc';
      const strength = evaluatePasswordStrength(password);

      expect(strength).toBe('very-weak');
      expect(getStrengthColor(strength)).toBe('bg-red-500');
      expect(getStrengthText(strength)).toBe('Very Weak');
      expect(getStrengthPercentage(strength)).toBe(25);
    });

    it('calculates correct values for a strong password', () => {
      const password = 'MyStr0ng!Pass';
      const strength = evaluatePasswordStrength(password);

      expect(strength).toBe('strong');
      expect(getStrengthColor(strength)).toBe('bg-green-500');
      expect(getStrengthText(strength)).toBe('Strong');
      expect(getStrengthPercentage(strength)).toBe(100);
    });
  });
});
