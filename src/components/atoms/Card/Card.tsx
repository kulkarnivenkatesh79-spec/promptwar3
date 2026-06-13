/**
 * @fileoverview Card component for consistent content containers.
 * Features glassmorphism options and hover states.
 * @module components/atoms/Card
 */

import { type HTMLAttributes, forwardRef } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the card has a glassmorphic background */
  readonly glass?: boolean;
  /** Whether the card should elevate on hover */
  readonly hoverable?: boolean;
  /** Padding size variant */
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the card should take full height of parent */
  readonly fullHeight?: boolean;
}

/**
 * Container component with consistent styling and optional glassmorphism.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    glass = false,
    hoverable = false,
    padding = 'md',
    fullHeight = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const classes = [
    styles.card,
    glass ? styles.glass : '',
    hoverable ? styles.hoverable : '',
    styles[`padding-${padding}`],
    fullHeight ? styles.fullHeight : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

export default Card;
