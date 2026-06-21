/**
 * @fileoverview Theme context for the Carbon Footprint Awareness Platform.
 * Supports 'light', 'dark', and 'system' preferences with automatic
 * system preference detection and localStorage persistence.
 * @module context/ThemeContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { Theme, ThemeContextValue } from '../types';

/** localStorage key for persisting the user's theme preference */
const THEME_STORAGE_KEY = 'theme_preference' as const;

/** Media query string for detecting system dark mode preference */
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)' as const;

/**
 * Internal context — consumers should use the {@link useTheme} hook instead.
 * @internal
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = 'ThemeContext';

/**
 * Reads the persisted theme preference from localStorage.
 * Returns `'system'` if no valid preference is found.
 */
function loadStoredPreference(): Theme {
  try {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[ThemeContext] Failed to read theme preference:', error);
  }
  return 'system';
}

/**
 * Persists the theme preference to localStorage.
 */
function savePreference(preference: Theme): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[ThemeContext] Failed to persist theme preference:', error);
  }
}

/**
 * Resolves the effective theme ('light' | 'dark') from the user preference,
 * taking the system preference into account when preference is 'system'.
 */
function resolveTheme(
  preference: Theme,
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (preference === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Props for the {@link ThemeProvider} component.
 */
interface ThemeProviderProps {
  /** Child components that will have access to theme context */
  readonly children: React.ReactNode;
}

/**
 * Provides theme context to the component tree.
 *
 * Manages the user's theme preference ('light' | 'dark' | 'system'),
 * detects the OS-level color scheme preference, applies the resolved
 * theme as a `data-theme` attribute on `<html>`, and persists the
 * preference to localStorage.
 *
 * @example
 * ```tsx
 * // In your App.tsx
 * import { ThemeProvider } from './context/ThemeContext';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <MyApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [preference, setPreferenceState] = useState<Theme>(loadStoredPreference);

  // Track the system dark-mode preference
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(DARK_MODE_QUERY).matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

    const handleChange = (event: MediaQueryListEvent): void => {
      setSystemPrefersDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Resolve the effective theme
  const theme = resolveTheme(preference, systemPrefersDark);

  // Apply `data-theme` to the document root whenever the effective theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * Sets a specific theme preference and persists it.
   */
  const setTheme = useCallback((newPreference: Theme): void => {
    setPreferenceState(newPreference);
    savePreference(newPreference);
  }, []);

  /**
   * Toggles between light and dark.
   * If the current preference is 'system', it switches to the
   * opposite of whatever the system currently resolves to.
   */
  const toggleTheme = useCallback((): void => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setPreferenceState(nextTheme);
    savePreference(nextTheme);
  }, [theme]);

  /** Memoized context value to prevent unnecessary re-renders */
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      toggleTheme,
      setTheme,
    }),
    [theme, preference, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the current theme context.
 *
 * Must be called within a {@link ThemeProvider}. Throws if called
 * outside of one.
 *
 * @returns The current {@link ThemeContextValue}
 * @throws Error if used outside of a ThemeProvider
 *
 * @example
 * ```tsx
 * const { theme, preference, toggleTheme, setTheme } = useTheme();
 *
 * return (
 *   <button onClick={toggleTheme} aria-label="Toggle theme">
 *     {theme === 'dark' ? '☀️' : '🌙'}
 *   </button>
 * );
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error(
      'useTheme must be used within a <ThemeProvider>. ' +
        'Wrap your component tree with <ThemeProvider> to use this hook.',
    );
  }
  return context;
}
