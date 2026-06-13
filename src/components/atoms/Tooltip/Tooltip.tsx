/**
 * @fileoverview Accessible Tooltip component.
 * Appears on hover/focus to provide additional context.
 * @module components/atoms/Tooltip
 */

import { type ReactNode, useState, useRef, useEffect, useCallback, useId } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** The content to show inside the tooltip */
  readonly content: ReactNode;
  /** The element that triggers the tooltip */
  readonly children: ReactNode;
  /** Position relative to the child element */
  readonly position?: 'top' | 'right' | 'bottom' | 'left';
  /** Additional classes for the tooltip container */
  readonly className?: string;
  /** Delay in ms before showing (default: 300) */
  readonly delay?: number;
}

/**
 * Accessible tooltip component that appears on hover or focus.
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<number | ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const tooltipId = `tooltip-${id}`;

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const showTooltip = useCallback(() => {
    clearTimer();
    setShouldRender(true);
    // Small delay to allow rendering before transition
    requestAnimationFrame(() => {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    });
  }, [clearTimer, delay]);

  const hideTooltip = useCallback(() => {
    clearTimer();
    setIsVisible(false);
    // Wait for transition to finish before unmounting
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 200); // Matches CSS transition duration
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      hideTooltip();
    }
  }, [isVisible, hideTooltip]);

  const containerClasses = [
    styles.container,
    className,
  ].filter(Boolean).join(' ');

  const tooltipClasses = [
    styles.tooltip,
    styles[position],
    isVisible ? styles.visible : '',
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {shouldRender && (
        <div id={tooltipId} className={tooltipClasses} role="tooltip">
          {content}
          <div className={styles.arrow} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
