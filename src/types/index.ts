/**
 * @fileoverview Central type definitions for the Carbon Footprint Awareness Platform.
 * All data models, enums, and interfaces are defined here to ensure
 * type safety and consistency across the application.
 * @module types
 */

/* ============================================================
 * ENUMS
 * ============================================================ */

/** Transport mode categories for emission calculations */
export enum TransportMode {
  CarGasoline = 'car_gasoline',
  CarDiesel = 'car_diesel',
  CarHybrid = 'car_hybrid',
  CarElectric = 'car_electric',
  Bus = 'bus',
  Train = 'train',
  PlaneShortHaul = 'plane_short_haul',
  PlaneLongHaul = 'plane_long_haul',
  Bicycle = 'bicycle',
  Walking = 'walking',
}

/** Diet type categories for emission calculations */
export enum DietType {
  MeatHeavy = 'meat_heavy',
  Average = 'average',
  Vegetarian = 'vegetarian',
  Vegan = 'vegan',
}

/** Energy source categories */
export enum EnergySource {
  ElectricityUS = 'electricity_us',
  ElectricityEU = 'electricity_eu',
  ElectricityGlobal = 'electricity_global',
  ElectricityRenewable = 'electricity_renewable',
  NaturalGas = 'natural_gas',
  HeatingOil = 'heating_oil',
}

/** Recommendation difficulty levels */
export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

/** Recommendation categories */
export enum RecommendationCategory {
  Transport = 'transport',
  Diet = 'diet',
  Energy = 'energy',
  Lifestyle = 'lifestyle',
}

/** Eco-score grades */
export enum EcoGrade {
  APlus = 'A+',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

/** Time range for progress views */
export enum TimeRange {
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

/* ============================================================
 * DATA MODELS
 * ============================================================ */

/** Transport entry for a single transport activity */
export interface TransportEntry {
  /** Unique identifier */
  readonly id: string;
  /** Mode of transport */
  readonly mode: TransportMode;
  /** Distance in kilometers */
  readonly distanceKm: number;
  /** Frequency per week */
  readonly frequencyPerWeek: number;
}

/** Diet configuration for emission calculations */
export interface DietConfig {
  /** Primary diet type */
  readonly dietType: DietType;
  /** Number of meals per day (1-6) */
  readonly mealsPerDay: number;
  /** Food waste percentage (0-100) */
  readonly foodWastePercent: number;
}

/** Energy usage data for home emissions */
export interface EnergyUsage {
  /** Monthly electricity consumption in kWh */
  readonly electricityKwh: number;
  /** Electricity source type */
  readonly electricitySource: EnergySource;
  /** Monthly natural gas usage in therms */
  readonly naturalGasTherms: number;
  /** Monthly heating oil usage in gallons */
  readonly heatingOilGallons: number;
}

/** Complete carbon footprint entry for a specific date */
export interface CarbonEntry {
  /** Unique identifier */
  readonly id: string;
  /** ISO date string (YYYY-MM-DD) */
  readonly date: string;
  /** Transport emissions in kg CO2 */
  readonly transportEmissions: number;
  /** Diet emissions in kg CO2 */
  readonly dietEmissions: number;
  /** Energy emissions in kg CO2 */
  readonly energyEmissions: number;
  /** Total emissions in kg CO2 */
  readonly totalEmissions: number;
  /** Transport entries used for calculation */
  readonly transportEntries: readonly TransportEntry[];
  /** Diet configuration used */
  readonly dietConfig: DietConfig;
  /** Energy usage data used */
  readonly energyUsage: EnergyUsage;
}

/** User profile for personalization */
export interface UserProfile {
  /** User display name */
  readonly name: string;
  /** Country/region for localized factors */
  readonly region: 'us' | 'eu' | 'global';
  /** Onboarding completed flag */
  readonly onboarded: boolean;
  /** Date of first use (ISO string) */
  readonly joinDate: string;
}

/** User-defined emission reduction goal */
export interface Goal {
  /** Unique identifier */
  readonly id: string;
  /** Goal description */
  readonly description: string;
  /** Target emissions in tonnes CO2/year */
  readonly targetTonnes: number;
  /** Start date (ISO string) */
  readonly startDate: string;
  /** Target completion date (ISO string) */
  readonly targetDate: string;
  /** Whether goal is achieved */
  readonly achieved: boolean;
}

/** AI-generated recommendation for reducing emissions */
export interface Recommendation {
  /** Unique identifier */
  readonly id: string;
  /** Short title */
  readonly title: string;
  /** Detailed description */
  readonly description: string;
  /** Category of the recommendation */
  readonly category: RecommendationCategory;
  /** Difficulty level */
  readonly difficulty: Difficulty;
  /** Estimated CO2 savings in tonnes/year */
  readonly estimatedSavingsTonnes: number;
  /** Priority score (0-100, higher = more impactful) */
  readonly priorityScore: number;
  /** Whether user has completed this action */
  readonly completed: boolean;
  /** Icon name from Lucide */
  readonly icon: string;
}

/** Category breakdown for display */
export interface CategoryBreakdown {
  /** Category name */
  readonly name: string;
  /** Emissions in kg CO2 */
  readonly value: number;
  /** Percentage of total */
  readonly percentage: number;
  /** Display color (hex) */
  readonly color: string;
}

/** Monthly aggregated data point for charts */
export interface MonthlyDataPoint {
  /** Month label (e.g., "Jan 2026") */
  readonly month: string;
  /** Total emissions in kg CO2 */
  readonly total: number;
  /** Transport emissions in kg CO2 */
  readonly transport: number;
  /** Diet emissions in kg CO2 */
  readonly diet: number;
  /** Energy emissions in kg CO2 */
  readonly energy: number;
}

/** Activity log entry */
export interface ActivityLogEntry {
  /** Unique identifier */
  readonly id: string;
  /** Timestamp (ISO string) */
  readonly timestamp: string;
  /** Action description */
  readonly action: string;
  /** Category */
  readonly category: RecommendationCategory;
  /** CO2 impact in kg (negative = savings) */
  readonly impactKg: number;
}

/* ============================================================
 * STATE MANAGEMENT
 * ============================================================ */

/** Complete application state for CarbonContext */
export interface CarbonState {
  /** User profile */
  readonly profile: UserProfile;
  /** All carbon footprint entries */
  readonly entries: readonly CarbonEntry[];
  /** Current/latest carbon entry being edited */
  readonly currentEntry: CarbonEntry | null;
  /** User-defined goals */
  readonly goals: readonly Goal[];
  /** AI recommendations */
  readonly recommendations: readonly Recommendation[];
  /** Activity log */
  readonly activityLog: readonly ActivityLogEntry[];
  /** Loading state */
  readonly isLoading: boolean;
}

/** Action types for CarbonContext reducer */
export enum CarbonActionType {
  SetProfile = 'SET_PROFILE',
  AddEntry = 'ADD_ENTRY',
  UpdateCurrentEntry = 'UPDATE_CURRENT_ENTRY',
  ClearCurrentEntry = 'CLEAR_CURRENT_ENTRY',
  AddGoal = 'ADD_GOAL',
  UpdateGoal = 'UPDATE_GOAL',
  RemoveGoal = 'REMOVE_GOAL',
  SetRecommendations = 'SET_RECOMMENDATIONS',
  ToggleRecommendation = 'TOGGLE_RECOMMENDATION',
  AddActivity = 'ADD_ACTIVITY',
  LoadState = 'LOAD_STATE',
  SetLoading = 'SET_LOADING',
}

/** Discriminated union of all possible actions */
export type CarbonAction =
  | { readonly type: CarbonActionType.SetProfile; readonly payload: UserProfile }
  | { readonly type: CarbonActionType.AddEntry; readonly payload: CarbonEntry }
  | { readonly type: CarbonActionType.UpdateCurrentEntry; readonly payload: CarbonEntry }
  | { readonly type: CarbonActionType.ClearCurrentEntry }
  | { readonly type: CarbonActionType.AddGoal; readonly payload: Goal }
  | { readonly type: CarbonActionType.UpdateGoal; readonly payload: Goal }
  | { readonly type: CarbonActionType.RemoveGoal; readonly payload: string }
  | { readonly type: CarbonActionType.SetRecommendations; readonly payload: readonly Recommendation[] }
  | { readonly type: CarbonActionType.ToggleRecommendation; readonly payload: string }
  | { readonly type: CarbonActionType.AddActivity; readonly payload: ActivityLogEntry }
  | { readonly type: CarbonActionType.LoadState; readonly payload: CarbonState }
  | { readonly type: CarbonActionType.SetLoading; readonly payload: boolean };

/** Theme type */
export type Theme = 'light' | 'dark' | 'system';

/** Theme context value */
export interface ThemeContextValue {
  /** Current resolved theme */
  readonly theme: 'light' | 'dark';
  /** User preference */
  readonly preference: Theme;
  /** Toggle between light and dark */
  readonly toggleTheme: () => void;
  /** Set specific theme preference */
  readonly setTheme: (theme: Theme) => void;
}

/* ============================================================
 * COMPONENT PROPS
 * ============================================================ */

/** Base props shared by interactive components */
export interface BaseComponentProps {
  /** Additional CSS class names */
  readonly className?: string;
  /** Test ID for testing */
  readonly 'data-testid'?: string;
}

/** Calculator step props */
export interface CalculatorStepProps {
  /** Callback when step is completed */
  readonly onNext: () => void;
  /** Callback to go to previous step */
  readonly onPrev: () => void;
  /** Whether this is the active step */
  readonly isActive: boolean;
}
