/**
 * @fileoverview Accessible Button component with multiple variants.
 * Supports primary, secondary, outline, ghost, and danger styles.
 * Fully keyboard accessible with focus-visible indicators.
 * @module components/atoms/Button
 */

import { type ButtonHTMLAttributes, type ReactNode, memo, useCallback } from 'react';
import styles from './Button.module.css';

/** Button visual variants */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/** Button size options */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Props for the Button component */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  readonly variant?: ButtonVariant;
  /** Size of the button */
  readonly size?: ButtonSize;
  /** Whether the button is in a loading state */
  readonly isLoading?: boolean;
  /** Icon element to display before the label */
  readonly leftIcon?: ReactNode;
  /** Icon element to display after the label */
  readonly rightIcon?: ReactNode;
  /** Whether the button takes full width */
  readonly fullWidth?: boolean;
  /** Test ID for testing */
  readonly 'data-testid'?: string;
}

/**
 * Accessible button component with multiple variants and sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * ```
 */
const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  /** Prevent click during loading state */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return;
      onClick?.(e);
    },
    [isLoading, disabled, onClick]
  );

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true" role="presentation">
          <svg viewBox="0 0 24 24" fill="none" className={styles.spinnerSvg}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
        </span>
      )}
      {leftIcon && !isLoading && (
        <span className={styles.icon} aria-hidden="true">{leftIcon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {rightIcon && (
        <span className={styles.icon} aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;
