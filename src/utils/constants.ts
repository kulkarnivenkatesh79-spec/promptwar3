/**
 * @fileoverview Constants and emission factors for carbon footprint calculations.
 * Data sourced from EPA GHG Emission Factors Hub (2025), IPCC, and EIA.
 * All values are in metric units (kg CO2, km, kWh, etc.)
 * @module utils/constants
 */

import {
  TransportMode,
  DietType,
  EnergySource,
  type Recommendation,
  RecommendationCategory,
  Difficulty,
} from '../types';

/* ============================================================
 * TRANSPORT EMISSION FACTORS (kg CO2 per passenger-km)
 * Source: EPA GHG Emission Factors Hub, 2025
 * ============================================================ */

/** Transport emission factors in kg CO2 per passenger-km */
export const TRANSPORT_FACTORS: Readonly<Record<TransportMode, number>> = {
  [TransportMode.CarGasoline]: 0.170,
  [TransportMode.CarDiesel]: 0.160,
  [TransportMode.CarHybrid]: 0.105,
  [TransportMode.CarElectric]: 0.053,
  [TransportMode.Bus]: 0.071,
  [TransportMode.Train]: 0.041,
  [TransportMode.PlaneShortHaul]: 0.255,
  [TransportMode.PlaneLongHaul]: 0.195,
  [TransportMode.Bicycle]: 0.0,
  [TransportMode.Walking]: 0.0,
} as const;

/** Human-readable labels for transport modes */
export const TRANSPORT_LABELS: Readonly<Record<TransportMode, string>> = {
  [TransportMode.CarGasoline]: 'Car (Gasoline)',
  [TransportMode.CarDiesel]: 'Car (Diesel)',
  [TransportMode.CarHybrid]: 'Car (Hybrid)',
  [TransportMode.CarElectric]: 'Car (Electric)',
  [TransportMode.Bus]: 'Bus',
  [TransportMode.Train]: 'Train',
  [TransportMode.PlaneShortHaul]: 'Plane (Short-haul)',
  [TransportMode.PlaneLongHaul]: 'Plane (Long-haul)',
  [TransportMode.Bicycle]: 'Bicycle',
  [TransportMode.Walking]: 'Walking',
} as const;

/* ============================================================
 * DIET EMISSION FACTORS (kg CO2e per year)
 * Source: NIH/MDPI studies, IPCC
 * ============================================================ */

/** Diet emission factors in kg CO2e per year */
export const DIET_FACTORS_YEARLY: Readonly<Record<DietType, number>> = {
  [DietType.MeatHeavy]: 1322,
  [DietType.Average]: 993,
  [DietType.Vegetarian]: 895,
  [DietType.Vegan]: 504,
} as const;

/** Diet emission factors in kg CO2e per day */
export const DIET_FACTORS_DAILY: Readonly<Record<DietType, number>> = {
  [DietType.MeatHeavy]: 3.62,
  [DietType.Average]: 2.72,
  [DietType.Vegetarian]: 2.45,
  [DietType.Vegan]: 1.38,
} as const;

/** Human-readable labels for diet types */
export const DIET_LABELS: Readonly<Record<DietType, string>> = {
  [DietType.MeatHeavy]: 'Meat-heavy',
  [DietType.Average]: 'Average (Omnivore)',
  [DietType.Vegetarian]: 'Vegetarian',
  [DietType.Vegan]: 'Vegan',
} as const;

/* ============================================================
 * ENERGY EMISSION FACTORS
 * Source: EPA eGRID2023, EIA
 * ============================================================ */

/** Electricity emission factors in kg CO2 per kWh */
export const ELECTRICITY_FACTORS: Readonly<Record<string, number>> = {
  [EnergySource.ElectricityUS]: 0.367,
  [EnergySource.ElectricityEU]: 0.230,
  [EnergySource.ElectricityGlobal]: 0.475,
  [EnergySource.ElectricityRenewable]: 0.0,
} as const;

/** Natural gas emission factor: kg CO2 per therm */
export const NATURAL_GAS_FACTOR = 5.306 as const;

/** Heating oil emission factor: kg CO2 per gallon */
export const HEATING_OIL_FACTOR = 10.19 as const;

/** Human-readable labels for energy sources */
export const ENERGY_LABELS: Readonly<Record<EnergySource, string>> = {
  [EnergySource.ElectricityUS]: 'US Grid Average',
  [EnergySource.ElectricityEU]: 'EU Grid Average',
  [EnergySource.ElectricityGlobal]: 'Global Average',
  [EnergySource.ElectricityRenewable]: '100% Renewable',
  [EnergySource.NaturalGas]: 'Natural Gas',
  [EnergySource.HeatingOil]: 'Heating Oil',
} as const;

/* ============================================================
 * BENCHMARKS (tonnes CO2 per person per year)
 * Source: Our World in Data, IPCC
 * ============================================================ */

/** Carbon footprint benchmarks in tonnes CO2/person/year */
export const BENCHMARKS = {
  /** Global average carbon footprint */
  globalAverage: 4.7,
  /** United States average */
  usAverage: 14.2,
  /** European Union average */
  euAverage: 6.8,
  /** Paris Agreement 2030 target */
  parisTarget2030: 2.5,
  /** Paris Agreement 2050 target */
  parisTarget2050: 2.0,
} as const;

/** Benchmark labels for display */
export const BENCHMARK_LABELS: Readonly<Record<string, string>> = {
  globalAverage: 'Global Average',
  usAverage: 'US Average',
  euAverage: 'EU Average',
  parisTarget2030: 'Paris 2030 Target',
  parisTarget2050: 'Paris 2050 Target',
} as const;

/* ============================================================
 * ECO-GRADE THRESHOLDS (tonnes CO2/year)
 * ============================================================ */

/** Thresholds for eco-grade calculation in tonnes CO2/year */
export const ECO_GRADE_THRESHOLDS = {
  /** A+ grade: below Paris 2050 target */
  aPlus: 2.0,
  /** A grade: below Paris 2030 target */
  a: 2.5,
  /** B grade: below global average */
  b: 4.7,
  /** C grade: below EU average */
  c: 6.8,
  /** D grade: below US average */
  d: 14.2,
  /** F grade: above US average */
} as const;

/* ============================================================
 * WEEKS PER YEAR (for annualizing weekly data)
 * ============================================================ */

/** Number of weeks in a year */
export const WEEKS_PER_YEAR = 52 as const;

/** Number of months in a year */
export const MONTHS_PER_YEAR = 12 as const;

/** Average meals per day (used as default) */
export const DEFAULT_MEALS_PER_DAY = 3 as const;

/** Days per year */
export const DAYS_PER_YEAR = 365 as const;

/* ============================================================
 * INPUT VALIDATION LIMITS
 * ============================================================ */

/** Maximum distance in km for a single transport entry */
export const MAX_DISTANCE_KM = 50000 as const;

/** Maximum frequency per week */
export const MAX_FREQUENCY_PER_WEEK = 14 as const;

/** Maximum electricity usage in kWh per month */
export const MAX_ELECTRICITY_KWH = 10000 as const;

/** Maximum natural gas in therms per month */
export const MAX_NATURAL_GAS_THERMS = 500 as const;

/** Maximum heating oil in gallons per month */
export const MAX_HEATING_OIL_GALLONS = 500 as const;

/** Maximum meals per day */
export const MAX_MEALS_PER_DAY = 6 as const;

/** Maximum food waste percentage */
export const MAX_FOOD_WASTE_PERCENT = 100 as const;

/* ============================================================
 * CATEGORY COLORS
 * ============================================================ */

/** Colors for emission categories in charts */
export const CATEGORY_COLORS = {
  transport: '#06b6d4',
  diet: '#10b981',
  energy: '#f59e0b',
} as const;

/* ============================================================
 * REDUCTION STRATEGIES (pre-built recommendation templates)
 * ============================================================ */

/** Template recommendations keyed by a strategy identifier */
export const RECOMMENDATION_TEMPLATES: readonly Omit<Recommendation, 'priorityScore' | 'completed'>[] = [
  {
    id: 'rec_car_to_transit',
    title: 'Switch to Public Transit',
    description: 'Replace car commuting with bus or train rides. Public transit produces significantly fewer emissions per passenger-km than driving alone.',
    category: RecommendationCategory.Transport,
    difficulty: Difficulty.Medium,
    estimatedSavingsTonnes: 2.2,
    icon: 'Bus',
  },
  {
    id: 'rec_ev_switch',
    title: 'Switch to an Electric Vehicle',
    description: 'Electric vehicles produce up to 90% fewer driving emissions than gasoline cars, even accounting for electricity generation.',
    category: RecommendationCategory.Transport,
    difficulty: Difficulty.Hard,
    estimatedSavingsTonnes: 2.4,
    icon: 'Zap',
  },
  {
    id: 'rec_reduce_flights',
    title: 'Reduce Air Travel',
    description: 'Eliminate one long-haul round-trip flight per year. Consider video conferencing for business or train travel for shorter trips.',
    category: RecommendationCategory.Transport,
    difficulty: Difficulty.Medium,
    estimatedSavingsTonnes: 2.0,
    icon: 'PlaneTakeoff',
  },
  {
    id: 'rec_bike_commute',
    title: 'Bike or Walk Short Trips',
    description: 'For trips under 5 km, switch to cycling or walking. This eliminates emissions entirely and improves your health.',
    category: RecommendationCategory.Transport,
    difficulty: Difficulty.Easy,
    estimatedSavingsTonnes: 0.5,
    icon: 'Bike',
  },
  {
    id: 'rec_meat_to_veg',
    title: 'Adopt a Vegetarian Diet',
    description: 'Switching from a meat-heavy to vegetarian diet can save over 1.5 tonnes of CO2 per year while improving heart health.',
    category: RecommendationCategory.Diet,
    difficulty: Difficulty.Medium,
    estimatedSavingsTonnes: 1.5,
    icon: 'Salad',
  },
  {
    id: 'rec_meat_to_vegan',
    title: 'Try a Plant-Based Diet',
    description: 'A fully plant-based diet produces the lowest food-related emissions, saving over 2 tonnes of CO2 annually.',
    category: RecommendationCategory.Diet,
    difficulty: Difficulty.Hard,
    estimatedSavingsTonnes: 2.1,
    icon: 'Leaf',
  },
  {
    id: 'rec_reduce_food_waste',
    title: 'Reduce Food Waste',
    description: 'Plan meals ahead, store food properly, and compost scraps. Reducing food waste by 50% can meaningfully cut your diet emissions.',
    category: RecommendationCategory.Diet,
    difficulty: Difficulty.Easy,
    estimatedSavingsTonnes: 0.3,
    icon: 'Recycle',
  },
  {
    id: 'rec_renewable_energy',
    title: 'Switch to Renewable Energy',
    description: 'Choose a green energy provider or install solar panels. 100% renewable electricity eliminates your grid emissions entirely.',
    category: RecommendationCategory.Energy,
    difficulty: Difficulty.Medium,
    estimatedSavingsTonnes: 2.5,
    icon: 'Sun',
  },
  {
    id: 'rec_insulation',
    title: 'Improve Home Insulation',
    description: 'Better insulation reduces heating and cooling energy needs. Weatherize windows, doors, and attics for significant energy savings.',
    category: RecommendationCategory.Energy,
    difficulty: Difficulty.Hard,
    estimatedSavingsTonnes: 0.75,
    icon: 'Home',
  },
  {
    id: 'rec_led_lighting',
    title: 'Switch to LED Lighting',
    description: 'Replace all incandescent and CFL bulbs with LEDs. They use up to 75% less energy and last 25 times longer.',
    category: RecommendationCategory.Energy,
    difficulty: Difficulty.Easy,
    estimatedSavingsTonnes: 0.15,
    icon: 'Lightbulb',
  },
  {
    id: 'rec_thermostat',
    title: 'Optimize Your Thermostat',
    description: 'Adjust your thermostat by 1-2°C (lower in winter, higher in summer). A smart thermostat can automate this for maximum savings.',
    category: RecommendationCategory.Energy,
    difficulty: Difficulty.Easy,
    estimatedSavingsTonnes: 0.3,
    icon: 'Thermometer',
  },
  {
    id: 'rec_carpool',
    title: 'Start Carpooling',
    description: 'Share rides with colleagues or neighbors. Carpooling with one other person halves your per-person driving emissions.',
    category: RecommendationCategory.Transport,
    difficulty: Difficulty.Easy,
    estimatedSavingsTonnes: 1.1,
    icon: 'Users',
  },
] as const;
