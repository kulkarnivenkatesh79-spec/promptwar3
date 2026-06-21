/**
 * @fileoverview Custom hook for synchronizing React state with localStorage.
 * Handles JSON serialization/deserialization, SSR safety, and corrupt data gracefully.
 * @module hooks/useLocalStorage
 */

import { useState, useCallback } from 'react';

/**
 * Checks whether the `window` object and `localStorage` are available.
 * Returns `false` during SSR or in environments without storage access.
 */
function isStorageAvailable(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  } catch {
    return false;
  }
}

/**
 * A React hook that persists state to `localStorage`, automatically
 * serializing to JSON on write and deserializing on read.
 *
 * Handles SSR environments (falls back to `initialValue`), JSON parse
 * errors (falls back to `initialValue` and clears the corrupt key),
 * and supports functional updater patterns.
 *
 * @typeParam T - The type of the stored value (must be JSON-serializable)
 * @param key - The localStorage key to store the value under
 * @param initialValue - The default value when no stored value exists or storage is unavailable
 * @returns A tuple of `[storedValue, setValue]` mirroring the `useState` API
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage<string>('user_name', '');
 * const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);
 *
 * // Supports functional updater pattern
 * setSettings((prev) => ({ ...prev, darkMode: true }));
 *
 * return (
 *   <input
 *     value={name}
 *     onChange={(e) => setName(e.target.value)}
 *     aria-label="User name"
 *   />
 * );
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initializer: read from localStorage on first render only
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isStorageAvailable()) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          `[useLocalStorage] Failed to parse stored value for key "${key}". ` +
            `Falling back to initial value.`,
          error,
        );
      }
      // Clear corrupt data so it doesn't persist
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage access may also fail; silently ignore
      }
      return initialValue;
    }
  });

  /**
   * Sets the stored value and persists it to localStorage.
   * Accepts either a direct value or a functional updater (like `setState`).
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        // Resolve functional updater if provided
        const nextValue =
          value instanceof Function ? value(prevValue) : value;

        // Persist to localStorage
        if (isStorageAvailable()) {
          try {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn(
                `[useLocalStorage] Failed to persist value for key "${key}".`,
                error,
              );
            }
          }
        }

        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
