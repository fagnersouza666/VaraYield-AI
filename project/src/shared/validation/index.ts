import { ValidationRule, ValidationResult } from '../../types';

export const createValidator = <T>(rules: ValidationRule<T>[]) => {
  return (value: T): ValidationResult => {
    const errors = rules
      .filter(rule => !rule.validate(value))
      .map(rule => rule.message);
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

export const numberValidation = {
  isPositive: (value: number): boolean => value > 0,
  isInRange: (min: number, max: number) => (value: number): boolean => 
    value >= min && value <= max,
  isFinite: (value: number): boolean => Number.isFinite(value),
};

export const stringValidation = {
  isNotEmpty: (value: string): boolean => value.trim().length > 0,
  hasMinLength: (minLength: number) => (value: string): boolean => 
    value.length >= minLength,
  isValidEmail: (value: string): boolean => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
};

export const objectValidation = {
  isNotNull: <T>(value: T | null): value is T => value !== null,
  isNotUndefined: <T>(value: T | undefined): value is T => value !== undefined,
  hasProperty: <T extends Record<string, unknown>>(
    prop: keyof T
  ) => (obj: T): boolean => prop in obj,
};