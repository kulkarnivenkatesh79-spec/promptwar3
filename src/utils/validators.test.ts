/**
 * @fileoverview Unit tests for input validation and sanitization utilities.
 * Covers edge cases, boundary conditions, and XSS protection.
 * @module utils/validators.test
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  escapeHtml,
  sanitizeNumber,
  isValidDistance,
  isValidFrequency,
  isValidElectricity,
  isValidNaturalGas,
  isValidHeatingOil,
  isValidMealsPerDay,
  isValidFoodWaste,
  isValidDateString,
  validateTransportEntry,
  validateDietConfig,
  validateEnergyUsage,
} from './validators';
import { TransportMode, DietType, EnergySource } from '../types';
import {
  MAX_DISTANCE_KM,
  MAX_FREQUENCY_PER_WEEK,
  MAX_ELECTRICITY_KWH,
  MAX_NATURAL_GAS_THERMS,
  MAX_HEATING_OIL_GALLONS,
  MAX_MEALS_PER_DAY,
  MAX_FOOD_WASTE_PERCENT,
} from './constants';

/* ============================================================
 * sanitizeString
 * ============================================================ */

describe('sanitizeString', () => {
  it('strips HTML tags', () => {
    expect(sanitizeString('<b>Hello</b>')).toBe('Hello');
  });

  it('strips script tags (XSS protection)', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('strips nested and malformed tags', () => {
    expect(sanitizeString('<div><span>Test</span></div>')).toBe('Test');
    expect(sanitizeString('<<b>>')).toBe('>');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('limits length to 500 characters', () => {
    const longString = 'a'.repeat(600);
    expect(sanitizeString(longString).length).toBe(500);
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeString('Hello World 123')).toBe('Hello World 123');
  });
});

/* ============================================================
 * escapeHtml
 * ============================================================ */

describe('escapeHtml', () => {
  it('escapes angle brackets', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("'hello'")).toBe('&#39;hello&#39;');
  });

  it('escapes a full XSS payload', () => {
    const input = '<script>alert("xss")</script>';
    const result = escapeHtml(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('&lt;');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

/* ============================================================
 * sanitizeNumber
 * ============================================================ */

describe('sanitizeNumber', () => {
  it('passes through valid numbers within range', () => {
    expect(sanitizeNumber(50, 0, 100, 0)).toBe(50);
  });

  it('clamps values above max', () => {
    expect(sanitizeNumber(150, 0, 100, 0)).toBe(100);
  });

  it('clamps values below min', () => {
    expect(sanitizeNumber(-10, 0, 100, 0)).toBe(0);
  });

  it('returns fallback for NaN', () => {
    expect(sanitizeNumber(NaN, 0, 100, 42)).toBe(42);
  });

  it('returns fallback for Infinity', () => {
    expect(sanitizeNumber(Infinity, 0, 100, 42)).toBe(42);
  });

  it('returns fallback for non-numeric strings', () => {
    expect(sanitizeNumber('abc', 0, 100, 0)).toBe(0);
  });

  it('converts numeric strings correctly', () => {
    expect(sanitizeNumber('42', 0, 100, 0)).toBe(42);
  });

  it('handles boundary values exactly', () => {
    expect(sanitizeNumber(0, 0, 100, 50)).toBe(0);
    expect(sanitizeNumber(100, 0, 100, 50)).toBe(100);
  });

  it('handles null input', () => {
    expect(sanitizeNumber(null, 0, 100, 0)).toBe(0);
  });

  it('handles undefined input', () => {
    expect(sanitizeNumber(undefined, 0, 100, 0)).toBe(0);
  });
});

/* ============================================================
 * Domain-Specific Validators
 * ============================================================ */

describe('isValidDistance', () => {
  it('accepts 0', () => expect(isValidDistance(0)).toBe(true));
  it('accepts max', () => expect(isValidDistance(MAX_DISTANCE_KM)).toBe(true));
  it('accepts mid-range', () => expect(isValidDistance(100)).toBe(true));
  it('rejects negative', () => expect(isValidDistance(-1)).toBe(false));
  it('rejects above max', () => expect(isValidDistance(MAX_DISTANCE_KM + 1)).toBe(false));
  it('rejects NaN', () => expect(isValidDistance(NaN)).toBe(false));
  it('rejects Infinity', () => expect(isValidDistance(Infinity)).toBe(false));
});

describe('isValidFrequency', () => {
  it('accepts 0', () => expect(isValidFrequency(0)).toBe(true));
  it('accepts max', () => expect(isValidFrequency(MAX_FREQUENCY_PER_WEEK)).toBe(true));
  it('rejects negative', () => expect(isValidFrequency(-1)).toBe(false));
  it('rejects above max', () => expect(isValidFrequency(MAX_FREQUENCY_PER_WEEK + 1)).toBe(false));
});

describe('isValidElectricity', () => {
  it('accepts valid range', () => expect(isValidElectricity(500)).toBe(true));
  it('rejects above max', () => expect(isValidElectricity(MAX_ELECTRICITY_KWH + 1)).toBe(false));
});

describe('isValidNaturalGas', () => {
  it('accepts valid range', () => expect(isValidNaturalGas(100)).toBe(true));
  it('rejects above max', () => expect(isValidNaturalGas(MAX_NATURAL_GAS_THERMS + 1)).toBe(false));
});

describe('isValidHeatingOil', () => {
  it('accepts valid range', () => expect(isValidHeatingOil(50)).toBe(true));
  it('rejects above max', () => expect(isValidHeatingOil(MAX_HEATING_OIL_GALLONS + 1)).toBe(false));
});

describe('isValidMealsPerDay', () => {
  it('accepts 1', () => expect(isValidMealsPerDay(1)).toBe(true));
  it('accepts max', () => expect(isValidMealsPerDay(MAX_MEALS_PER_DAY)).toBe(true));
  it('rejects 0', () => expect(isValidMealsPerDay(0)).toBe(false));
  it('rejects above max', () => expect(isValidMealsPerDay(MAX_MEALS_PER_DAY + 1)).toBe(false));
});

describe('isValidFoodWaste', () => {
  it('accepts 0', () => expect(isValidFoodWaste(0)).toBe(true));
  it('accepts max', () => expect(isValidFoodWaste(MAX_FOOD_WASTE_PERCENT)).toBe(true));
  it('rejects negative', () => expect(isValidFoodWaste(-1)).toBe(false));
  it('rejects above max', () => expect(isValidFoodWaste(MAX_FOOD_WASTE_PERCENT + 1)).toBe(false));
});

/* ============================================================
 * isValidDateString
 * ============================================================ */

describe('isValidDateString', () => {
  it('accepts valid ISO date', () => {
    expect(isValidDateString('2026-01-15')).toBe(true);
  });

  it('accepts leap year date', () => {
    expect(isValidDateString('2024-02-29')).toBe(true);
  });

  it('rejects invalid leap year date', () => {
    expect(isValidDateString('2025-02-29')).toBe(false);
  });

  it('rejects invalid month', () => {
    expect(isValidDateString('2026-13-01')).toBe(false);
  });

  it('rejects invalid day', () => {
    expect(isValidDateString('2026-04-31')).toBe(false);
  });

  it('rejects non-date strings', () => {
    expect(isValidDateString('hello')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });

  it('rejects wrong format', () => {
    expect(isValidDateString('01/15/2026')).toBe(false);
  });
});

/* ============================================================
 * Type Guards
 * ============================================================ */

describe('validateTransportEntry', () => {
  it('accepts valid transport entry', () => {
    expect(validateTransportEntry({
      id: 'te_001',
      mode: TransportMode.CarGasoline,
      distanceKm: 30,
      frequencyPerWeek: 5,
    })).toBe(true);
  });

  it('rejects null', () => {
    expect(validateTransportEntry(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateTransportEntry(undefined)).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(validateTransportEntry({ id: '1' })).toBe(false);
  });

  it('rejects invalid mode', () => {
    expect(validateTransportEntry({
      id: '1', mode: 'spaceship', distanceKm: 10, frequencyPerWeek: 1,
    })).toBe(false);
  });

  it('rejects negative distance', () => {
    expect(validateTransportEntry({
      id: '1', mode: TransportMode.Bus, distanceKm: -5, frequencyPerWeek: 1,
    })).toBe(false);
  });

  it('rejects empty id', () => {
    expect(validateTransportEntry({
      id: '', mode: TransportMode.Bus, distanceKm: 10, frequencyPerWeek: 1,
    })).toBe(false);
  });
});

describe('validateDietConfig', () => {
  it('accepts valid diet config', () => {
    expect(validateDietConfig({
      dietType: DietType.Vegan,
      mealsPerDay: 3,
      foodWastePercent: 10,
    })).toBe(true);
  });

  it('rejects null', () => {
    expect(validateDietConfig(null)).toBe(false);
  });

  it('rejects invalid diet type', () => {
    expect(validateDietConfig({
      dietType: 'keto', mealsPerDay: 3, foodWastePercent: 0,
    })).toBe(false);
  });

  it('rejects 0 meals per day', () => {
    expect(validateDietConfig({
      dietType: DietType.Average, mealsPerDay: 0, foodWastePercent: 0,
    })).toBe(false);
  });
});

describe('validateEnergyUsage', () => {
  it('accepts valid energy usage', () => {
    expect(validateEnergyUsage({
      electricityKwh: 900,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 35,
      heatingOilGallons: 0,
    })).toBe(true);
  });

  it('rejects null', () => {
    expect(validateEnergyUsage(null)).toBe(false);
  });

  it('rejects invalid energy source', () => {
    expect(validateEnergyUsage({
      electricityKwh: 900,
      electricitySource: 'nuclear',
      naturalGasTherms: 35,
      heatingOilGallons: 0,
    })).toBe(false);
  });

  it('rejects negative electricity', () => {
    expect(validateEnergyUsage({
      electricityKwh: -100,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 0,
      heatingOilGallons: 0,
    })).toBe(false);
  });
});
