import {
  type TransportEntry,
  type DietConfig,
  type EnergyUsage,
  TransportMode,
  DietType,
  EnergySource,
} from '../types';
import {
  MAX_DISTANCE_KM,
  MAX_FREQUENCY_PER_WEEK,
  MAX_ELECTRICITY_KWH,
  MAX_NATURAL_GAS_THERMS,
  MAX_HEATING_OIL_GALLONS,
  MAX_MEALS_PER_DAY,
  MAX_FOOD_WASTE_PERCENT,
} from './constants';
const MAX_STRING_LENGTH = 500;
const HTML_TAG_REGEX = /<[^>]*>/g;
const ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const VALID_TRANSPORT_MODES: ReadonlySet<string> = new Set(
  Object.values(TransportMode),
);
const VALID_DIET_TYPES: ReadonlySet<string> = new Set(
  Object.values(DietType),
);
const VALID_ENERGY_SOURCES: ReadonlySet<string> = new Set(
  Object.values(EnergySource),
);
export function sanitizeString(input: string): string {
  const stripped = input.replace(HTML_TAG_REGEX, '');
  const trimmed = stripped.trim();
  return trimmed.slice(0, MAX_STRING_LENGTH);
}
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
export function sanitizeNumber(
  input: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const num = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(Math.max(num, min), max);
}
export function isValidDistance(km: number): boolean {
  return Number.isFinite(km) && km >= 0 && km <= MAX_DISTANCE_KM;
}
export function isValidFrequency(freq: number): boolean {
  return Number.isFinite(freq) && freq >= 0 && freq <= MAX_FREQUENCY_PER_WEEK;
}
export function isValidElectricity(kwh: number): boolean {
  return Number.isFinite(kwh) && kwh >= 0 && kwh <= MAX_ELECTRICITY_KWH;
}
export function isValidNaturalGas(therms: number): boolean {
  return Number.isFinite(therms) && therms >= 0 && therms <= MAX_NATURAL_GAS_THERMS;
}
export function isValidHeatingOil(gallons: number): boolean {
  return Number.isFinite(gallons) && gallons >= 0 && gallons <= MAX_HEATING_OIL_GALLONS;
}
export function isValidMealsPerDay(meals: number): boolean {
  return Number.isFinite(meals) && meals >= 1 && meals <= MAX_MEALS_PER_DAY;
}
export function isValidFoodWaste(percent: number): boolean {
  return Number.isFinite(percent) && percent >= 0 && percent <= MAX_FOOD_WASTE_PERCENT;
}
export function isValidDateString(date: string): boolean {
  if (!ISO_DATE_REGEX.test(date)) {
    return false;
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}
export function validateTransportEntry(
  entry: unknown,
): entry is TransportEntry {
  if (entry === null || typeof entry !== 'object') {
    return false;
  }
  const obj = entry as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    obj['id'].length > 0 &&
    typeof obj['mode'] === 'string' &&
    VALID_TRANSPORT_MODES.has(obj['mode']) &&
    typeof obj['distanceKm'] === 'number' &&
    isValidDistance(obj['distanceKm']) &&
    typeof obj['frequencyPerWeek'] === 'number' &&
    isValidFrequency(obj['frequencyPerWeek'])
  );
}
export function validateDietConfig(
  config: unknown,
): config is DietConfig {
  if (config === null || typeof config !== 'object') {
    return false;
  }
  const obj = config as Record<string, unknown>;
  return (
    typeof obj['dietType'] === 'string' &&
    VALID_DIET_TYPES.has(obj['dietType']) &&
    typeof obj['mealsPerDay'] === 'number' &&
    isValidMealsPerDay(obj['mealsPerDay']) &&
    typeof obj['foodWastePercent'] === 'number' &&
    isValidFoodWaste(obj['foodWastePercent'])
  );
}
export function validateEnergyUsage(
  usage: unknown,
): usage is EnergyUsage {
  if (usage === null || typeof usage !== 'object') {
    return false;
  }
  const obj = usage as Record<string, unknown>;
  return (
    typeof obj['electricityKwh'] === 'number' &&
    isValidElectricity(obj['electricityKwh']) &&
    typeof obj['electricitySource'] === 'string' &&
    VALID_ENERGY_SOURCES.has(obj['electricitySource']) &&
    typeof obj['naturalGasTherms'] === 'number' &&
    isValidNaturalGas(obj['naturalGasTherms']) &&
    typeof obj['heatingOilGallons'] === 'number' &&
    isValidHeatingOil(obj['heatingOilGallons'])
  );
}
