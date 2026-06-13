/**
 * @fileoverview Accessible Input component with validation and error states.
 * @module components/atoms/Input
 */

import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  readonly label: string;
  /** Error message to display */
  readonly error?: string;
  /** Helper text to display below input */
  readonly helperText?: string;
  /** Icon to display on the left */
  readonly leftIcon?: ReactNode;
  /** Icon to display on the right */
  readonly rightIcon?: ReactNode;
  /** Whether the input spans full width */
  readonly fullWidth?: boolean;
}

/**
 * Accessible form input component with label, error handling, and icons.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    className = '',
    id: providedId,
    required,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    error ? styles.hasError : '',
    leftIcon ? styles.hasLeftIcon : '',
    rightIcon ? styles.hasRightIcon : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      
      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.leftIcon} aria-hidden="true">{leftIcon}</span>}
        
        <input
          ref={ref}
          id={id}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, helperText ? helperId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          required={required}
          {...props}
        />
        
        {rightIcon && <span className={styles.rightIcon} aria-hidden="true">{rightIcon}</span>}
      </div>

      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
});

export default Input;
