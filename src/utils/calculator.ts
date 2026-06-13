/**
 * @fileoverview Carbon footprint calculation engine.
 *
 * Every function in this module is **pure** — it takes explicit inputs,
 * performs no I/O and returns a deterministic result.  All numeric inputs
 * are sanitized through {@link sanitizeNumber} before use so callers
 * never need to pre-validate.
 *
 * Complexity: all helpers run in O(1) or O(n) where n is the number of
 * transport entries.
 *
 * @module utils/calculator
 */

import {
  type TransportEntry,
  type DietConfig,
  type EnergyUsage,
  type CategoryBreakdown,
  EcoGrade,
  TransportMode,
} from '../types';

import {
  TRANSPORT_FACTORS,
  DIET_FACTORS_YEARLY,
  ELECTRICITY_FACTORS,
  NATURAL_GAS_FACTOR,
  HEATING_OIL_FACTOR,
  ECO_GRADE_THRESHOLDS,
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
  DEFAULT_MEALS_PER_DAY,
  CATEGORY_COLORS,
  MAX_DISTANCE_KM,
  MAX_FREQUENCY_PER_WEEK,
  MAX_ELECTRICITY_KWH,
  MAX_NATURAL_GAS_THERMS,
  MAX_HEATING_OIL_GALLONS,
  MAX_MEALS_PER_DAY,
  MAX_FOOD_WASTE_PERCENT,
} from './constants';

import { sanitizeNumber } from './validators';

/* ============================================================
 * INTERNAL CONSTANTS
 * ============================================================ */

/** Food-waste multiplier constant (25 % overhead per 100 % waste) */
const FOOD_WASTE_IMPACT_FACTOR = 0.25;

/** Minimum valid distance / frequency (used as lower clamp) */
const MIN_ZERO = 0;

/* ============================================================
 * TRANSPORT CALCULATIONS
 * ============================================================ */

/**
 * Calculate annualised transport emissions in **kg CO2**.
 *
 * Formula per entry:
 * ```
 * distanceKm × emissionFactor × frequencyPerWeek × 52
 * ```
 *
 * @param entries - Readonly array of transport entries.
 * @returns Annual transport emissions in kg CO2.
 */
export function calculateTransportEmissions(
  entries: readonly TransportEntry[],
): number {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 0;
  }

  return entries.reduce((total, entry) => {
    const factor = TRANSPORT_FACTORS[entry.mode as TransportMode] ?? 0;
    const distance = sanitizeNumber(
      entry.distanceKm,
      MIN_ZERO,
      MAX_DISTANCE_KM,
      0,
    );
    const frequency = sanitizeNumber(
      entry.frequencyPerWeek,
      MIN_ZERO,
      MAX_FREQUENCY_PER_WEEK,
      0,
    );

    return total + distance * factor * frequency * WEEKS_PER_YEAR;
  }, 0);
}

/* ============================================================
 * DIET CALCULATIONS
 * ============================================================ */

/**
 * Calculate annualised diet emissions in **kg CO2**.
 *
 * 1. Base yearly emissions from {@link DIET_FACTORS_YEARLY}.
 * 2. Adjusted by meals ratio: `mealsPerDay / DEFAULT_MEALS_PER_DAY`.
 * 3. Food waste overhead: `base × (1 + foodWastePercent / 100 × 0.25)`.
 *
 * @param config - Diet configuration.
 * @returns Annual diet emissions in kg CO2.
 */
export function calculateDietEmissions(config: DietConfig): number {
  const base = DIET_FACTORS_YEARLY[config.dietType] ?? 0;

  const meals = sanitizeNumber(
    config.mealsPerDay,
    1,
    MAX_MEALS_PER_DAY,
    DEFAULT_MEALS_PER_DAY,
  );
  const waste = sanitizeNumber(
    config.foodWastePercent,
    MIN_ZERO,
    MAX_FOOD_WASTE_PERCENT,
    0,
  );

  const mealsAdjusted = base * (meals / DEFAULT_MEALS_PER_DAY);
  return mealsAdjusted * (1 + (waste / 100) * FOOD_WASTE_IMPACT_FACTOR);
}

/* ============================================================
 * ENERGY CALCULATIONS
 * ============================================================ */

/**
 * Calculate annualised home-energy emissions in **kg CO2**.
 *
 * - Electricity: `kWh × source factor × 12`
 * - Natural gas: `therms × 5.306 × 12`
 * - Heating oil: `gallons × 10.19 × 12`
 *
 * @param usage - Monthly energy usage data.
 * @returns Annual energy emissions in kg CO2.
 */
export function calculateEnergyEmissions(usage: EnergyUsage): number {
  const electricityKwh = sanitizeNumber(
    usage.electricityKwh,
    MIN_ZERO,
    MAX_ELECTRICITY_KWH,
    0,
  );
  const gasTherms = sanitizeNumber(
    usage.naturalGasTherms,
    MIN_ZERO,
    MAX_NATURAL_GAS_THERMS,
    0,
  );
  const oilGallons = sanitizeNumber(
    usage.heatingOilGallons,
    MIN_ZERO,
    MAX_HEATING_OIL_GALLONS,
    0,
  );

  const electricityFactor =
    ELECTRICITY_FACTORS[usage.electricitySource] ?? 0;

  const electricityEmissions =
    electricityKwh * electricityFactor * MONTHS_PER_YEAR;
  const gasEmissions = gasTherms * NATURAL_GAS_FACTOR * MONTHS_PER_YEAR;
  const oilEmissions = oilGallons * HEATING_OIL_FACTOR * MONTHS_PER_YEAR;

  return electricityEmissions + gasEmissions + oilEmissions;
}

/* ============================================================
 * AGGREGATION & GRADING
 * ============================================================ */

/**
 * Sum transport, diet and energy emissions.
 *
 * @param transport - Transport emissions in kg CO2.
 * @param diet      - Diet emissions in kg CO2.
 * @param energy    - Energy emissions in kg CO2.
 * @returns Total annual emissions in kg CO2.
 */
export function calculateTotalEmissions(
  transport: number,
  diet: number,
  energy: number,
): number {
  const t = sanitizeNumber(transport, MIN_ZERO, Infinity, 0);
  const d = sanitizeNumber(diet, MIN_ZERO, Infinity, 0);
  const e = sanitizeNumber(energy, MIN_ZERO, Infinity, 0);
  return t + d + e;
}

/**
 * Determine an {@link EcoGrade} based on total annual emissions.
 *
 * | Grade | Threshold (tonnes CO2/yr) |
 * |-------|--------------------------|
 * | A+    | ≤ 2.0                    |
 * | A     | ≤ 2.5                    |
 * | B     | ≤ 4.7                    |
 * | C     | ≤ 6.8                    |
 * | D     | ≤ 14.2                   |
 * | F     | > 14.2                   |
 *
 * @param totalTonnes - Total annual emissions in **tonnes** CO2.
 * @returns The corresponding eco grade.
 */
export function calculateEcoGrade(totalTonnes: number): EcoGrade {
  const t = sanitizeNumber(totalTonnes, MIN_ZERO, Infinity, 0);

  if (t <= ECO_GRADE_THRESHOLDS.aPlus) return EcoGrade.APlus;
  if (t <= ECO_GRADE_THRESHOLDS.a) return EcoGrade.A;
  if (t <= ECO_GRADE_THRESHOLDS.b) return EcoGrade.B;
  if (t <= ECO_GRADE_THRESHOLDS.c) return EcoGrade.C;
  if (t <= ECO_GRADE_THRESHOLDS.d) return EcoGrade.D;
  return EcoGrade.F;
}

/* ============================================================
 * CATEGORY BREAKDOWN
 * ============================================================ */

/**
 * Build an array of {@link CategoryBreakdown} items for charting.
 *
 * Each item contains the category name, absolute kg CO2, the
 * percentage of the total, and a display colour.
 *
 * @param transport - Transport emissions in kg CO2.
 * @param diet      - Diet emissions in kg CO2.
 * @param energy    - Energy emissions in kg CO2.
 * @returns A three-element array ordered Transport → Diet → Energy.
 */
export function getCategoryBreakdown(
  transport: number,
  diet: number,
  energy: number,
): CategoryBreakdown[] {
  const total = calculateTotalEmissions(transport, diet, energy);

  const safePercent = (value: number): number =>
    total === 0 ? 0 : Math.round((value / total) * 1000) / 10;

  return [
    {
      name: 'Transport',
      value: sanitizeNumber(transport, MIN_ZERO, Infinity, 0),
      percentage: safePercent(transport),
      color: CATEGORY_COLORS.transport,
    },
    {
      name: 'Diet',
      value: sanitizeNumber(diet, MIN_ZERO, Infinity, 0),
      percentage: safePercent(diet),
      color: CATEGORY_COLORS.diet,
    },
    {
      name: 'Energy',
      value: sanitizeNumber(energy, MIN_ZERO, Infinity, 0),
      percentage: safePercent(energy),
      color: CATEGORY_COLORS.energy,
    },
  ];
}

/* ============================================================
 * CONVERSION HELPERS
 * ============================================================ */

/**
 * Convert kilograms CO2 to tonnes.
 *
 * @param kg - Emissions in kilograms.
 * @returns Emissions in metric tonnes (1 tonne = 1 000 kg).
 */
export function kgToTonnes(kg: number): number {
  return sanitizeNumber(kg, MIN_ZERO, Infinity, 0) / 1000;
}

/**
 * Convert tonnes CO2 to kilograms.
 *
 * @param tonnes - Emissions in metric tonnes.
 * @returns Emissions in kilograms.
 */
export function tonnesToKg(tonnes: number): number {
  return sanitizeNumber(tonnes, MIN_ZERO, Infinity, 0) * 1000;
}

/* ============================================================
 * ID GENERATION
 * ============================================================ */

/**
 * Generate a unique identifier string.
 *
 * Uses `crypto.randomUUID()` when available, otherwise falls back to
 * a timestamp + random-number combination.
 *
 * @returns A unique string suitable for use as an entity ID.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${randomPart}`;
}
