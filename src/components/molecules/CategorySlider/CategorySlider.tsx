/**
 * @fileoverview CategorySlider component for inputting values with a visual slider.
 * Accessible implementation using native range input.
 * @module components/molecules/CategorySlider
 */

import { type ChangeEvent, memo, useId } from 'react';
import styles from './CategorySlider.module.css';

export interface CategorySliderProps {
  /** Label for the slider */
  readonly label: string;
  /** Current value */
  readonly value: number;
  /** Minimum value */
  readonly min?: number;
  /** Maximum value */
  readonly max: number;
  /** Step increment */
  readonly step?: number;
  /** Function to call when value changes */
  readonly onChange: (value: number) => void;
  /** Unit to display next to the value (e.g., 'km', '%') */
  readonly unit?: string;
  /** Optional icon node to display next to label */
  readonly icon?: React.ReactNode;
  /** Color theme for the slider */
  readonly colorTheme?: 'primary' | 'transport' | 'diet' | 'energy';
  /** Accessible description for screen readers */
  readonly ariaDescription?: string;
}

/**
 * Custom styled range slider with label and value display.
 */
const CategorySlider = memo(function CategorySlider({
  label,
  value,
  min = 0,
  max,
  step = 1,
  onChange,
  unit = '',
  icon,
  colorTheme = 'primary',
  ariaDescription,
}: CategorySliderProps) {
  const id = useId();
  const sliderId = `slider-${id}`;
  const descId = `desc-${id}`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Calculate percentage for styling the track fill
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={`${styles.container} ${styles[colorTheme]}`}>
      <div className={styles.header}>
        <label htmlFor={sliderId} className={styles.label}>
          {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
          {label}
        </label>
        <div className={styles.valueDisplay}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <div 
          className={styles.trackFill} 
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          id={sliderId}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={styles.slider}
          aria-describedby={ariaDescription ? descId : undefined}
          aria-valuetext={`${value} ${unit}`}
        />
      </div>

      <div className={styles.limits} aria-hidden="true">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>

      {ariaDescription && (
        <span id={descId} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </div>
  );
});

export default CategorySlider;
