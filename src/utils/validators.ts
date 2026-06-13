/**
 * @fileoverview Input validation and sanitization utilities for the
 * Carbon Footprint Awareness Platform.
 *
 * Every user-facing input flows through these helpers before it reaches
 * any calculation or storage layer.  All functions are **pure** — they
 * produce no side effects and are safe to call from any context.
 *
 * @module utils/validators
 */

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

/* ============================================================
 * INTERNAL HELPERS
 * ============================================================ */

/** Maximum allowed string length after sanitization */
const MAX_STRING_LENGTH = 500;

/** Regex that matches any HTML tag (opening, closing, self-closing) */
const HTML_TAG_REGEX = /<[^>]*>/g;

/** Regex for ISO 8601 date string (YYYY-MM-DD) */
const ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/** Set of valid TransportMode values for fast look-up */
const VALID_TRANSPORT_MODES: ReadonlySet<string> = new Set(
  Object.values(TransportMode),
);

/** Set of valid DietType values for fast look-up */
const VALID_DIET_TYPES: ReadonlySet<string> = new Set(
  Object.values(DietType),
);

/** Set of valid EnergySource values for fast look-up */
const VALID_ENERGY_SOURCES: ReadonlySet<string> = new Set(
  Object.values(EnergySource),
);

/* ============================================================
 * STRING SANITIZATION
 * ============================================================ */

/**
 * Strip HTML tags, trim whitespace and limit length.
 *
 * @param input - The raw string to sanitize.
 * @returns A safe, trimmed string of at most {@link MAX_STRING_LENGTH} characters.
 *
 * @example
 * ```ts
 * sanitizeString('<b>Hello</b>  World  ')  // → 'Hello  World'
 * ```
 */
export function sanitizeString(input: string): string {
  const stripped = input.replace(HTML_TAG_REGEX, '');
  const trimmed = stripped.trim();
  return trimmed.slice(0, MAX_STRING_LENGTH);
}

/**
 * Escape HTML special characters so the string is safe for DOM insertion.
 *
 * @param str - Raw string that may contain HTML entities.
 * @returns The escaped string.
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>')
 * // → '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
 * NUMERIC SANITIZATION
 * ============================================================ */

/**
 * Validate and clamp a numeric value to the given range.
 *
 * Handles `NaN`, `Infinity`, non-number types and out-of-range values
 * gracefully by returning the provided {@link fallback}.
 *
 * @param input    - The value to validate (may be any type).
 * @param min      - Inclusive lower bound.
 * @param max      - Inclusive upper bound.
 * @param fallback - Value returned when {@link input} is invalid.
 * @returns A valid number within `[min, max]`.
 *
 * @example
 * ```ts
 * sanitizeNumber('42', 0, 100, 0)   // → 42
 * sanitizeNumber(NaN,  0, 100, 0)   // → 0
 * sanitizeNumber(150,  0, 100, 0)   // → 100
 * ```
 */
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

/* ============================================================
 * DOMAIN-SPECIFIC VALIDATORS
 * ============================================================ */

/**
 * Validate that a distance value is within acceptable bounds.
 *
 * @param km - Distance in kilometres.
 * @returns `true` when `0 ≤ km ≤ MAX_DISTANCE_KM`.
 */
export function isValidDistance(km: number): boolean {
  return Number.isFinite(km) && km >= 0 && km <= MAX_DISTANCE_KM;
}

/**
 * Validate that a weekly frequency value is within acceptable bounds.
 *
 * @param freq - Frequency per week.
 * @returns `true` when `0 ≤ freq ≤ MAX_FREQUENCY_PER_WEEK`.
 */
export function isValidFrequency(freq: number): boolean {
  return Number.isFinite(freq) && freq >= 0 && freq <= MAX_FREQUENCY_PER_WEEK;
}

/**
 * Validate monthly electricity consumption.
 *
 * @param kwh - Electricity usage in kilowatt-hours.
 * @returns `true` when `0 ≤ kwh ≤ MAX_ELECTRICITY_KWH`.
 */
export function isValidElectricity(kwh: number): boolean {
  return Number.isFinite(kwh) && kwh >= 0 && kwh <= MAX_ELECTRICITY_KWH;
}

/**
 * Validate monthly natural gas consumption.
 *
 * @param therms - Gas usage in therms.
 * @returns `true` when `0 ≤ therms ≤ MAX_NATURAL_GAS_THERMS`.
 */
export function isValidNaturalGas(therms: number): boolean {
  return Number.isFinite(therms) && therms >= 0 && therms <= MAX_NATURAL_GAS_THERMS;
}

/**
 * Validate monthly heating oil consumption.
 *
 * @param gallons - Oil usage in gallons.
 * @returns `true` when `0 ≤ gallons ≤ MAX_HEATING_OIL_GALLONS`.
 */
export function isValidHeatingOil(gallons: number): boolean {
  return Number.isFinite(gallons) && gallons >= 0 && gallons <= MAX_HEATING_OIL_GALLONS;
}

/**
 * Validate meals-per-day count.
 *
 * @param meals - Number of meals eaten daily.
 * @returns `true` when `1 ≤ meals ≤ MAX_MEALS_PER_DAY`.
 */
export function isValidMealsPerDay(meals: number): boolean {
  return Number.isFinite(meals) && meals >= 1 && meals <= MAX_MEALS_PER_DAY;
}

/**
 * Validate food waste percentage.
 *
 * @param percent - Percentage of food wasted (0-100).
 * @returns `true` when `0 ≤ percent ≤ MAX_FOOD_WASTE_PERCENT`.
 */
export function isValidFoodWaste(percent: number): boolean {
  return Number.isFinite(percent) && percent >= 0 && percent <= MAX_FOOD_WASTE_PERCENT;
}

/**
 * Validate an ISO 8601 date string (`YYYY-MM-DD`).
 *
 * Checks format **and** that the date actually exists (e.g. 2025-02-29
 * is rejected because 2025 is not a leap year).
 *
 * @param date - The string to validate.
 * @returns `true` when {@link date} is a valid ISO date.
 */
export function isValidDateString(date: string): boolean {
  if (!ISO_DATE_REGEX.test(date)) {
    return false;
  }

  // Verify the date actually exists (e.g. reject 2025-02-30)
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  // Ensure the parsed date matches what was supplied
  const [year, month, day] = date.split('-').map(Number);
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}

/* ============================================================
 * TYPE GUARDS
 * ============================================================ */

/**
 * Runtime type guard for {@link TransportEntry}.
 *
 * Validates the shape **and** the domain constraints of each field so
 * the caller can trust the data for downstream calculations.
 *
 * @param entry - The unknown value to validate.
 * @returns `true` when {@link entry} satisfies the `TransportEntry` interface.
 */
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

/**
 * Runtime type guard for {@link DietConfig}.
 *
 * @param config - The unknown value to validate.
 * @returns `true` when {@link config} satisfies the `DietConfig` interface.
 */
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

/**
 * Runtime type guard for {@link EnergyUsage}.
 *
 * @param usage - The unknown value to validate.
 * @returns `true` when {@link usage} satisfies the `EnergyUsage` interface.
 */
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
