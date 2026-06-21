/**
 * @fileoverview Main state management context for the Carbon Footprint Awareness Platform.
 * Uses React.createContext + useReducer for predictable state management.
 * Persists state to localStorage and loads/validates on mount.
 * Includes sample data so the dashboard is populated on first visit.
 * @module context/CarbonContext
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from 'react';
import type {
  CarbonState,
  CarbonAction,
  CarbonEntry,
  UserProfile,
  Goal,
  Recommendation,
  ActivityLogEntry,
  TransportEntry,
  DietConfig,
  EnergyUsage,
} from '../types';
import {
  CarbonActionType,
  TransportMode,
  DietType,
  EnergySource,
  RecommendationCategory,
  Difficulty,
} from '../types';

/* ============================================================
 * CONSTANTS
 * ============================================================ */

/** localStorage key for persisting the application state */
const STORAGE_KEY = 'carbon_footprint_data' as const;

/* ============================================================
 * SAMPLE DATA GENERATION
 * ============================================================ */

/**
 * Generates a deterministic UUID-like ID from a seed string.
 * Not cryptographically secure — used only for sample data.
 */
function sampleId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(3, '0')}`;
}

/**
 * Returns an ISO date string for a date `monthsAgo` months before today,
 * pinned to the 15th of that month.
 */
function dateMonthsAgo(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(15);
  return d.toISOString().slice(0, 10);
}

/**
 * Generates sample application state with 6 months of entries
 * showing a decreasing emissions trend, a couple of goals,
 * and some activity log entries.
 *
 * @returns A fully-formed {@link CarbonState} with realistic sample data
 */
// eslint-disable-next-line react-refresh/only-export-components
export function generateSampleData(): CarbonState {
  // --- Transport entries template ---
  const sampleTransport: readonly TransportEntry[] = [
    {
      id: 'te_001',
      mode: TransportMode.CarGasoline,
      distanceKm: 30,
      frequencyPerWeek: 5,
    },
    {
      id: 'te_002',
      mode: TransportMode.Train,
      distanceKm: 15,
      frequencyPerWeek: 3,
    },
  ];

  // --- Diet config ---
  const sampleDiet: DietConfig = {
    dietType: DietType.Average,
    mealsPerDay: 3,
    foodWastePercent: 15,
  };

  // --- Energy usage ---
  const sampleEnergy: EnergyUsage = {
    electricityKwh: 900,
    electricitySource: EnergySource.ElectricityUS,
    naturalGasTherms: 35,
    heatingOilGallons: 0,
  };

  // Decreasing trend data (kg CO2 totals per month)
  const monthlyTrend = [
    { transport: 420, diet: 220, energy: 330 }, // 6 months ago — highest
    { transport: 395, diet: 210, energy: 310 }, // 5 months ago
    { transport: 360, diet: 195, energy: 295 }, // 4 months ago
    { transport: 330, diet: 180, energy: 280 }, // 3 months ago
    { transport: 290, diet: 170, energy: 260 }, // 2 months ago
    { transport: 255, diet: 155, energy: 245 }, // 1 month ago — lowest
  ];

  const entries: CarbonEntry[] = monthlyTrend.map((data, idx) => {
    const monthsAgo = 6 - idx;
    const total = data.transport + data.diet + data.energy;
    return {
      id: sampleId('entry', idx),
      date: dateMonthsAgo(monthsAgo),
      transportEmissions: data.transport,
      dietEmissions: data.diet,
      energyEmissions: data.energy,
      totalEmissions: total,
      transportEntries: sampleTransport,
      dietConfig: sampleDiet,
      energyUsage: sampleEnergy,
    };
  });

  // --- Goals ---
  const goals: Goal[] = [
    {
      id: 'goal_001',
      description: 'Reduce monthly emissions below 600 kg CO2',
      targetTonnes: 7.2,
      startDate: dateMonthsAgo(6),
      targetDate: dateMonthsAgo(-6), // 6 months from now
      achieved: false,
    },
    {
      id: 'goal_002',
      description: 'Switch to public transit for commuting',
      targetTonnes: 5.0,
      startDate: dateMonthsAgo(3),
      targetDate: dateMonthsAgo(-3),
      achieved: false,
    },
  ];

  // --- Recommendations (subset of templates, with scores) ---
  const recommendations: Recommendation[] = [
    {
      id: 'rec_car_to_transit',
      title: 'Switch to Public Transit',
      description:
        'Replace car commuting with bus or train rides. Public transit produces significantly fewer emissions per passenger-km than driving alone.',
      category: RecommendationCategory.Transport,
      difficulty: Difficulty.Medium,
      estimatedSavingsTonnes: 2.2,
      priorityScore: 85,
      completed: false,
      icon: 'Bus',
    },
    {
      id: 'rec_reduce_food_waste',
      title: 'Reduce Food Waste',
      description:
        'Plan meals ahead, store food properly, and compost scraps. Reducing food waste by 50% can meaningfully cut your diet emissions.',
      category: RecommendationCategory.Diet,
      difficulty: Difficulty.Easy,
      estimatedSavingsTonnes: 0.3,
      priorityScore: 60,
      completed: true,
      icon: 'Recycle',
    },
    {
      id: 'rec_led_lighting',
      title: 'Switch to LED Lighting',
      description:
        'Replace all incandescent and CFL bulbs with LEDs. They use up to 75% less energy and last 25 times longer.',
      category: RecommendationCategory.Energy,
      difficulty: Difficulty.Easy,
      estimatedSavingsTonnes: 0.15,
      priorityScore: 45,
      completed: false,
      icon: 'Lightbulb',
    },
    {
      id: 'rec_renewable_energy',
      title: 'Switch to Renewable Energy',
      description:
        'Choose a green energy provider or install solar panels. 100% renewable electricity eliminates your grid emissions entirely.',
      category: RecommendationCategory.Energy,
      difficulty: Difficulty.Medium,
      estimatedSavingsTonnes: 2.5,
      priorityScore: 90,
      completed: false,
      icon: 'Sun',
    },
  ];

  // --- Activity log ---
  const activityLog: ActivityLogEntry[] = [
    {
      id: 'log_001',
      timestamp: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      action: 'Logged monthly carbon footprint',
      category: RecommendationCategory.Lifestyle,
      impactKg: 0,
    },
    {
      id: 'log_002',
      timestamp: new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      action: 'Switched to LED lighting throughout the house',
      category: RecommendationCategory.Energy,
      impactKg: -12.5,
    },
    {
      id: 'log_003',
      timestamp: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      action: 'Started composting food scraps',
      category: RecommendationCategory.Diet,
      impactKg: -8.3,
    },
    {
      id: 'log_004',
      timestamp: new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      action: 'Took the train instead of driving to work',
      category: RecommendationCategory.Transport,
      impactKg: -15.0,
    },
  ];

  // --- Profile ---
  const profile: UserProfile = {
    name: 'Eco Explorer',
    region: 'us',
    onboarded: true,
    joinDate: dateMonthsAgo(6),
  };

  return {
    profile,
    entries,
    currentEntry: null,
    goals,
    recommendations,
    activityLog,
    isLoading: false,
  };
}

/* ============================================================
 * INITIAL STATE
 * ============================================================ */

/** The initial state used when no persisted state is found */
const initialState: CarbonState = generateSampleData();

/* ============================================================
 * REDUCER
 * ============================================================ */

/**
 * Pure reducer function handling all {@link CarbonActionType} cases.
 * Each case returns a new state object (no mutations).
 *
 * @param state - Current application state
 * @param action - Dispatched action (discriminated union)
 * @returns New state after applying the action
 */
function carbonReducer(state: CarbonState, action: CarbonAction): CarbonState {
  switch (action.type) {
    case CarbonActionType.SetProfile:
      return {
        ...state,
        profile: action.payload,
      };

    case CarbonActionType.AddEntry:
      return {
        ...state,
        entries: [...state.entries, action.payload],
        currentEntry: null,
      };

    case CarbonActionType.UpdateCurrentEntry:
      return {
        ...state,
        currentEntry: action.payload,
      };

    case CarbonActionType.ClearCurrentEntry:
      return {
        ...state,
        currentEntry: null,
      };

    case CarbonActionType.AddGoal:
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };

    case CarbonActionType.UpdateGoal:
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal,
        ),
      };

    case CarbonActionType.RemoveGoal:
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
      };

    case CarbonActionType.SetRecommendations:
      return {
        ...state,
        recommendations: action.payload,
      };

    case CarbonActionType.ToggleRecommendation:
      return {
        ...state,
        recommendations: state.recommendations.map((rec) =>
          rec.id === action.payload
            ? { ...rec, completed: !rec.completed }
            : rec,
        ),
      };

    case CarbonActionType.AddActivity:
      return {
        ...state,
        activityLog: [action.payload, ...state.activityLog],
      };

    case CarbonActionType.LoadState:
      return action.payload;

    case CarbonActionType.SetLoading:
      return {
        ...state,
        isLoading: action.payload,
      };

    default: {
      // Exhaustiveness check — the `never` type ensures all cases are handled
      const _exhaustive: never = action;
      if (import.meta.env.DEV) console.warn('[carbonReducer] Unhandled action:', _exhaustive);
      return state;
    }
  }
}

/* ============================================================
 * STATE VALIDATION
 * ============================================================ */

/**
 * Validates that a parsed object has the expected shape of {@link CarbonState}.
 * Performs structural checks rather than full deep validation.
 *
 * @param data - The parsed object to validate
 * @returns `true` if the object structurally matches CarbonState
 */
function isValidCarbonState(data: unknown): data is CarbonState {
  if (data === null || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check required top-level properties and their types
  if (typeof obj.profile !== 'object' || obj.profile === null) return false;
  if (!Array.isArray(obj.entries)) return false;
  if (!Array.isArray(obj.goals)) return false;
  if (!Array.isArray(obj.recommendations)) return false;
  if (!Array.isArray(obj.activityLog)) return false;
  if (typeof obj.isLoading !== 'boolean') return false;

  // Validate profile shape
  const profile = obj.profile as Record<string, unknown>;
  if (typeof profile.name !== 'string') return false;
  if (!['us', 'eu', 'global'].includes(profile.region as string)) return false;
  if (typeof profile.onboarded !== 'boolean') return false;
  if (typeof profile.joinDate !== 'string') return false;

  // Validate entries have required numeric fields
  for (const entry of obj.entries as Array<Record<string, unknown>>) {
    if (typeof entry.id !== 'string') return false;
    if (typeof entry.date !== 'string') return false;
    if (typeof entry.totalEmissions !== 'number') return false;
    if (typeof entry.transportEmissions !== 'number') return false;
    if (typeof entry.dietEmissions !== 'number') return false;
    if (typeof entry.energyEmissions !== 'number') return false;
  }

  return true;
}

/**
 * Attempts to load and validate state from localStorage.
 * Returns `null` if the stored state is missing, corrupt, or invalid.
 */
function loadPersistedState(): CarbonState | null {
  try {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);

    if (!isValidCarbonState(parsed)) {
      if (import.meta.env.DEV) {
        console.warn(
          '[CarbonContext] Stored state failed validation. Using sample data.',
        );
      }
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        '[CarbonContext] Failed to parse stored state. Using sample data.',
        error,
      );
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore secondary storage errors
    }
    return null;
  }
}

/**
 * Persists the application state to localStorage.
 * Silently catches errors (e.g., quota exceeded).
 */
function persistState(state: CarbonState): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[CarbonContext] Failed to persist state:', error);
  }
}

/* ============================================================
 * CONTEXT
 * ============================================================ */

/** Shape of the context value provided by CarbonProvider */
interface CarbonContextValue {
  /** Current application state */
  readonly state: CarbonState;
  /** Dispatch function for state mutations */
  readonly dispatch: React.Dispatch<CarbonAction>;
}

/**
 * Internal context — consumers should use the {@link useCarbonContext} hook.
 * @internal
 */
const CarbonContext = createContext<CarbonContextValue | null>(null);
CarbonContext.displayName = 'CarbonContext';

/* ============================================================
 * PROVIDER
 * ============================================================ */

/** Props for the {@link CarbonProvider} component */
interface CarbonProviderProps {
  /** Child components that will have access to carbon context */
  readonly children: React.ReactNode;
}

/**
 * Provides carbon footprint state and dispatch to the component tree.
 *
 * On mount, attempts to load persisted state from localStorage.
 * If the persisted state is missing or invalid, falls back to
 * sample data generated by {@link generateSampleData}.
 *
 * State is automatically persisted to localStorage whenever it changes.
 *
 * @example
 * ```tsx
 * import { CarbonProvider } from './context/CarbonContext';
 *
 * function App() {
 *   return (
 *     <CarbonProvider>
 *       <Dashboard />
 *     </CarbonProvider>
 *   );
 * }
 * ```
 */
export const CarbonProvider: React.FC<CarbonProviderProps> = ({ children }) => {
  // Initialize state: try persisted first, fall back to sample data
  const [state, dispatch] = useReducer(carbonReducer, initialState, () => {
    const persisted = loadPersistedState();
    return persisted ?? initialState;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    persistState(state);
  }, [state]);

  /** Memoized context value to prevent unnecessary consumer re-renders */
  const contextValue = useMemo<CarbonContextValue>(
    () => ({ state, dispatch }),
    [state, dispatch],
  );

  return (
    <CarbonContext.Provider value={contextValue}>
      {children}
    </CarbonContext.Provider>
  );
};

/* ============================================================
 * CONSUMER HOOK
 * ============================================================ */

/**
 * Hook to access the carbon footprint state and dispatch function.
 *
 * Must be called within a {@link CarbonProvider}. Throws if called
 * outside of one.
 *
 * @returns An object containing the current {@link CarbonState} and
 * a `dispatch` function for dispatching {@link CarbonAction} actions.
 * @throws Error if used outside of a CarbonProvider
 *
 * @example
 * ```tsx
 * const { state, dispatch } = useCarbonContext();
 *
 * // Read state
 * const totalEntries = state.entries.length;
 *
 * // Dispatch actions
 * dispatch({
 *   type: CarbonActionType.AddGoal,
 *   payload: { id: '1', description: 'Reduce by 20%', ... },
 * });
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCarbonContext(): CarbonContextValue {
  const context = useContext(CarbonContext);
  if (context === null) {
    throw new Error(
      'useCarbonContext must be used within a <CarbonProvider>. ' +
        'Wrap your component tree with <CarbonProvider> to use this hook.',
    );
  }
  return context;
}
