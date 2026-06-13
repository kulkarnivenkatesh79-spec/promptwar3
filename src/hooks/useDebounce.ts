/**
 * @fileoverview Custom debounce hook for delaying rapidly-changing values.
 * Prevents excessive re-renders and API calls by waiting for a pause in updates.
 * @module hooks/useDebounce
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the provided value that only updates
 * after the specified delay has elapsed since the last change.
 *
 * Useful for search inputs, form validation, and any scenario where
 * you want to wait for the user to stop typing before acting.
 *
 * @typeParam T - The type of the value being debounced
 * @param value - The rapidly-changing input value
 * @param delay - Delay in milliseconds before the value updates
 * @returns The debounced value, updated only after `delay` ms of inactivity
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This runs only after the user stops typing for 300ms
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 *
 * return (
 *   <input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     aria-label="Search"
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the delay
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay elapses, or on unmount
    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}
