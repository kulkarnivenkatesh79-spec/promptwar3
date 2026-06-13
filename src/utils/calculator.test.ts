/**
 * @fileoverview Comprehensive unit tests for the carbon calculation engine.
 * Tests all pure functions for accuracy, edge cases, and boundary conditions.
 * @module utils/calculator.test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateDietEmissions,
  calculateEnergyEmissions,
  calculateTotalEmissions,
  calculateEcoGrade,
  getCategoryBreakdown,
  kgToTonnes,
  tonnesToKg,
  generateId,
} from './calculator';
import { TransportMode, DietType, EnergySource, EcoGrade } from '../types';
import type { TransportEntry, DietConfig, EnergyUsage } from '../types';
import {
  TRANSPORT_FACTORS,
  DIET_FACTORS_YEARLY,
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
  NATURAL_GAS_FACTOR,
  HEATING_OIL_FACTOR,
} from './constants';

/* ============================================================
 * calculateTransportEmissions
 * ============================================================ */

describe('calculateTransportEmissions', () => {
  it('returns 0 for an empty entries array', () => {
    expect(calculateTransportEmissions([])).toBe(0);
  });

  it('returns 0 for zero-emission modes (bicycle, walking)', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.Bicycle, distanceKm: 10, frequencyPerWeek: 5 },
      { id: '2', mode: TransportMode.Walking, distanceKm: 3, frequencyPerWeek: 7 },
    ];
    expect(calculateTransportEmissions(entries)).toBe(0);
  });

  it('correctly calculates single gasoline car entry', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.CarGasoline, distanceKm: 30, frequencyPerWeek: 5 },
    ];
    const expected = 30 * TRANSPORT_FACTORS[TransportMode.CarGasoline] * 5 * WEEKS_PER_YEAR;
    expect(calculateTransportEmissions(entries)).toBeCloseTo(expected, 2);
  });

  it('sums emissions from multiple transport entries', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.CarGasoline, distanceKm: 20, frequencyPerWeek: 5 },
      { id: '2', mode: TransportMode.Train, distanceKm: 50, frequencyPerWeek: 2 },
    ];
    const expectedCar = 20 * TRANSPORT_FACTORS[TransportMode.CarGasoline] * 5 * WEEKS_PER_YEAR;
    const expectedTrain = 50 * TRANSPORT_FACTORS[TransportMode.Train] * 2 * WEEKS_PER_YEAR;
    expect(calculateTransportEmissions(entries)).toBeCloseTo(expectedCar + expectedTrain, 2);
  });

  it('handles zero distance gracefully', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.Bus, distanceKm: 0, frequencyPerWeek: 7 },
    ];
    expect(calculateTransportEmissions(entries)).toBe(0);
  });

  it('handles zero frequency gracefully', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.CarDiesel, distanceKm: 100, frequencyPerWeek: 0 },
    ];
    expect(calculateTransportEmissions(entries)).toBe(0);
  });

  it('clamps negative distance to 0', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.CarGasoline, distanceKm: -50, frequencyPerWeek: 5 },
    ];
    expect(calculateTransportEmissions(entries)).toBe(0);
  });

  it('returns a positive number for plane travel', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.PlaneLongHaul, distanceKm: 5000, frequencyPerWeek: 0.1 },
    ];
    expect(calculateTransportEmissions(entries)).toBeGreaterThan(0);
  });

  it('handles extremely large numbers without NaN', () => {
    const entries: TransportEntry[] = [
      { id: '1', mode: TransportMode.PlaneLongHaul, distanceKm: Number.MAX_SAFE_INTEGER, frequencyPerWeek: 7 },
    ];
    const result = calculateTransportEmissions(entries);
    expect(result).toBeGreaterThan(0);
    expect(Number.isNaN(result)).toBe(false);
  });
});

/* ============================================================
 * calculateDietEmissions
 * ============================================================ */

describe('calculateDietEmissions', () => {
  it('returns base yearly emissions for default 3 meals, 0% waste', () => {
    const config: DietConfig = {
      dietType: DietType.Average,
      mealsPerDay: 3,
      foodWastePercent: 0,
    };
    expect(calculateDietEmissions(config)).toBeCloseTo(DIET_FACTORS_YEARLY[DietType.Average], 1);
  });

  it('scales emissions proportionally to meals per day', () => {
    const config2meals: DietConfig = {
      dietType: DietType.Average,
      mealsPerDay: 2,
      foodWastePercent: 0,
    };
    const config6meals: DietConfig = {
      dietType: DietType.Average,
      mealsPerDay: 6,
      foodWastePercent: 0,
    };
    const base = DIET_FACTORS_YEARLY[DietType.Average];
    expect(calculateDietEmissions(config2meals)).toBeCloseTo(base * (2 / 3), 1);
    expect(calculateDietEmissions(config6meals)).toBeCloseTo(base * (6 / 3), 1);
  });

  it('adds food waste overhead correctly', () => {
    const config: DietConfig = {
      dietType: DietType.MeatHeavy,
      mealsPerDay: 3,
      foodWastePercent: 20,
    };
    const base = DIET_FACTORS_YEARLY[DietType.MeatHeavy];
    const expected = base * (1 + (20 / 100) * 0.25);
    expect(calculateDietEmissions(config)).toBeCloseTo(expected, 1);
  });

  it('vegan diet produces lowest emissions', () => {
    const veganConfig: DietConfig = { dietType: DietType.Vegan, mealsPerDay: 3, foodWastePercent: 0 };
    const meatConfig: DietConfig = { dietType: DietType.MeatHeavy, mealsPerDay: 3, foodWastePercent: 0 };
    expect(calculateDietEmissions(veganConfig)).toBeLessThan(calculateDietEmissions(meatConfig));
  });

  it('handles 100% food waste', () => {
    const config: DietConfig = {
      dietType: DietType.Average,
      mealsPerDay: 3,
      foodWastePercent: 100,
    };
    const base = DIET_FACTORS_YEARLY[DietType.Average];
    const expected = base * (1 + (100 / 100) * 0.25);
    expect(calculateDietEmissions(config)).toBeCloseTo(expected, 1);
  });
});

/* ============================================================
 * calculateEnergyEmissions
 * ============================================================ */

describe('calculateEnergyEmissions', () => {
  it('returns 0 for zero usage across all sources', () => {
    const usage: EnergyUsage = {
      electricityKwh: 0,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 0,
      heatingOilGallons: 0,
    };
    expect(calculateEnergyEmissions(usage)).toBe(0);
  });

  it('correctly calculates electricity-only emissions', () => {
    const usage: EnergyUsage = {
      electricityKwh: 500,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 0,
      heatingOilGallons: 0,
    };
    const expected = 500 * 0.367 * MONTHS_PER_YEAR;
    expect(calculateEnergyEmissions(usage)).toBeCloseTo(expected, 1);
  });

  it('correctly calculates natural gas emissions', () => {
    const usage: EnergyUsage = {
      electricityKwh: 0,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 50,
      heatingOilGallons: 0,
    };
    const expected = 50 * NATURAL_GAS_FACTOR * MONTHS_PER_YEAR;
    expect(calculateEnergyEmissions(usage)).toBeCloseTo(expected, 1);
  });

  it('correctly calculates heating oil emissions', () => {
    const usage: EnergyUsage = {
      electricityKwh: 0,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 0,
      heatingOilGallons: 30,
    };
    const expected = 30 * HEATING_OIL_FACTOR * MONTHS_PER_YEAR;
    expect(calculateEnergyEmissions(usage)).toBeCloseTo(expected, 1);
  });

  it('sums all energy sources correctly', () => {
    const usage: EnergyUsage = {
      electricityKwh: 900,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms: 35,
      heatingOilGallons: 10,
    };
    const elec = 900 * 0.367 * MONTHS_PER_YEAR;
    const gas = 35 * NATURAL_GAS_FACTOR * MONTHS_PER_YEAR;
    const oil = 10 * HEATING_OIL_FACTOR * MONTHS_PER_YEAR;
    expect(calculateEnergyEmissions(usage)).toBeCloseTo(elec + gas + oil, 1);
  });

  it('returns 0 for 100% renewable electricity', () => {
    const usage: EnergyUsage = {
      electricityKwh: 1000,
      electricitySource: EnergySource.ElectricityRenewable,
      naturalGasTherms: 0,
      heatingOilGallons: 0,
    };
    expect(calculateEnergyEmissions(usage)).toBe(0);
  });
});

/* ============================================================
 * calculateTotalEmissions
 * ============================================================ */

describe('calculateTotalEmissions', () => {
  it('sums three categories correctly', () => {
    expect(calculateTotalEmissions(1000, 2000, 3000)).toBe(6000);
  });

  it('handles zero values', () => {
    expect(calculateTotalEmissions(0, 0, 0)).toBe(0);
  });

  it('clamps negative values to 0', () => {
    expect(calculateTotalEmissions(-100, 200, 300)).toBe(500);
  });

  it('handles Infinity correctly by falling back to 0', () => {
    expect(calculateTotalEmissions(Infinity, 0, 0)).toBe(0);
  });

  it('handles -Infinity correctly', () => {
    expect(calculateTotalEmissions(-Infinity, 0, 0)).toBe(0);
  });
});

/* ============================================================
 * calculateEcoGrade
 * ============================================================ */

describe('calculateEcoGrade', () => {
  it('assigns A+ for ≤ 2.0 tonnes', () => {
    expect(calculateEcoGrade(1.5)).toBe(EcoGrade.APlus);
    expect(calculateEcoGrade(2.0)).toBe(EcoGrade.APlus);
  });

  it('assigns A for ≤ 2.5 tonnes', () => {
    expect(calculateEcoGrade(2.1)).toBe(EcoGrade.A);
    expect(calculateEcoGrade(2.5)).toBe(EcoGrade.A);
  });

  it('assigns B for ≤ 4.7 tonnes', () => {
    expect(calculateEcoGrade(3.0)).toBe(EcoGrade.B);
    expect(calculateEcoGrade(4.7)).toBe(EcoGrade.B);
  });

  it('assigns C for ≤ 6.8 tonnes', () => {
    expect(calculateEcoGrade(5.0)).toBe(EcoGrade.C);
    expect(calculateEcoGrade(6.8)).toBe(EcoGrade.C);
  });

  it('assigns D for ≤ 14.2 tonnes', () => {
    expect(calculateEcoGrade(10.0)).toBe(EcoGrade.D);
    expect(calculateEcoGrade(14.2)).toBe(EcoGrade.D);
  });

  it('assigns F for > 14.2 tonnes', () => {
    expect(calculateEcoGrade(15.0)).toBe(EcoGrade.F);
    expect(calculateEcoGrade(100.0)).toBe(EcoGrade.F);
  });

  it('handles 0 emissions (A+)', () => {
    expect(calculateEcoGrade(0)).toBe(EcoGrade.APlus);
  });
});

/* ============================================================
 * getCategoryBreakdown
 * ============================================================ */

describe('getCategoryBreakdown', () => {
  it('returns three categories with correct names', () => {
    const breakdown = getCategoryBreakdown(100, 200, 300);
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0]!.name).toBe('Transport');
    expect(breakdown[1]!.name).toBe('Diet');
    expect(breakdown[2]!.name).toBe('Energy');
  });

  it('calculates percentages that reflect proportions', () => {
    const breakdown = getCategoryBreakdown(500, 300, 200);
    expect(breakdown[0]!.percentage).toBe(50);
    expect(breakdown[1]!.percentage).toBe(30);
    expect(breakdown[2]!.percentage).toBe(20);
  });

  it('handles all-zero values without dividing by zero', () => {
    const breakdown = getCategoryBreakdown(0, 0, 0);
    breakdown.forEach(cat => {
      expect(cat.percentage).toBe(0);
      expect(cat.value).toBe(0);
    });
  });

  it('assigns correct colors to categories', () => {
    const breakdown = getCategoryBreakdown(1, 1, 1);
    expect(breakdown[0]!.color).toBe('#06b6d4'); // transport
    expect(breakdown[1]!.color).toBe('#10b981'); // diet
    expect(breakdown[2]!.color).toBe('#f59e0b'); // energy
  });
});

/* ============================================================
 * Conversion helpers
 * ============================================================ */

describe('kgToTonnes', () => {
  it('converts 1000 kg to 1 tonne', () => {
    expect(kgToTonnes(1000)).toBe(1);
  });

  it('converts 0 to 0', () => {
    expect(kgToTonnes(0)).toBe(0);
  });

  it('handles fractional values', () => {
    expect(kgToTonnes(500)).toBe(0.5);
  });
});

describe('tonnesToKg', () => {
  it('converts 1 tonne to 1000 kg', () => {
    expect(tonnesToKg(1)).toBe(1000);
  });

  it('converts 0 to 0', () => {
    expect(tonnesToKg(0)).toBe(0);
  });
});

/* ============================================================
 * generateId
 * ============================================================ */

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
