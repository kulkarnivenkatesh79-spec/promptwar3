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
const FOOD_WASTE_IMPACT_FACTOR = 0.25;
const MIN_ZERO = 0;
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
export function calculateEcoGrade(totalTonnes: number): EcoGrade {
  const t = sanitizeNumber(totalTonnes, MIN_ZERO, Infinity, 0);
  if (t <= ECO_GRADE_THRESHOLDS.aPlus) return EcoGrade.APlus;
  if (t <= ECO_GRADE_THRESHOLDS.a) return EcoGrade.A;
  if (t <= ECO_GRADE_THRESHOLDS.b) return EcoGrade.B;
  if (t <= ECO_GRADE_THRESHOLDS.c) return EcoGrade.C;
  if (t <= ECO_GRADE_THRESHOLDS.d) return EcoGrade.D;
  return EcoGrade.F;
}
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
export function kgToTonnes(kg: number): number {
  return sanitizeNumber(kg, MIN_ZERO, Infinity, 0) / 1000;
}
export function tonnesToKg(tonnes: number): number {
  return sanitizeNumber(tonnes, MIN_ZERO, Infinity, 0) * 1000;
}
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${randomPart}`;
}
