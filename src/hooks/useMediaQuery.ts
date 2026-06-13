/**
 * @fileoverview Custom hook for reactively matching CSS media queries.
 * Subscribes to `matchMedia` change events so the component re-renders
 * whenever the match state changes (e.g., viewport resize, theme toggle).
 * @module hooks/useMediaQuery
 */

import { useState, useEffect } from 'react';

/**
 * Returns whether the given CSS media query currently matches.
 *
 * The hook subscribes to `matchMedia` change events and will trigger
 * a re-render whenever the match state changes (e.g., when the viewport
 * is resized or the user toggles system dark mode).
 *
 * @param query - A valid CSS media query string
 * @returns `true` if the media query currently matches, `false` otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *     <p>Dark mode: {prefersDark ? 'Yes' : 'No'}</p>
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Safe check for SSR / environments without matchMedia
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Sync initial state in case it changed between render and effect
    setMatches(mediaQueryList.matches);

    /** Event handler for media query changes */
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
