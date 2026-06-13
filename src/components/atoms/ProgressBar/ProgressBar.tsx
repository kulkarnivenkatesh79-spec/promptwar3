/**
 * @fileoverview Accessible ProgressBar component.
 * @module components/atoms/ProgressBar
 */

import { type HTMLAttributes, forwardRef, useId } from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  readonly value: number;
  /** Maximum value (default 100) */
  readonly max?: number;
  /** Color variant */
  readonly variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Size variant */
  readonly size?: 'sm' | 'md' | 'lg';
  /** Whether to show the percentage label text */
  readonly showLabel?: boolean;
  /** Accessible label describing what this progress bar measures */
  readonly ariaLabel: string;
}

/**
 * Accessible progress bar component with multiple variants and sizes.
 */
const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    value,
    max = 100,
    variant = 'primary',
    size = 'md',
    showLabel = false,
    ariaLabel,
    className = '',
    ...props
  },
  ref
) {
  const id = useId();
  const labelId = `${id}-label`;
  
  // Ensure value is bounded between 0 and max
  const boundedValue = Math.max(0, Math.min(value, max));
  const percentage = Math.round((boundedValue / max) * 100);

  const containerClasses = [
    styles.container,
    className,
  ].filter(Boolean).join(' ');

  const trackClasses = [
    styles.track,
    styles[size],
  ].filter(Boolean).join(' ');

  const fillClasses = [
    styles.fill,
    styles[variant],
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {showLabel && (
        <div className={styles.labelContainer}>
          <span id={labelId} className={styles.label}>{ariaLabel}</span>
          <span className={styles.percentage}>{percentage}%</span>
        </div>
      )}
      
      <div 
        ref={ref}
        className={trackClasses}
        role="progressbar"
        aria-valuenow={boundedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={!showLabel ? ariaLabel : undefined}
        aria-labelledby={showLabel ? labelId : undefined}
      >
        <div 
          className={fillClasses} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

export default ProgressBar;
