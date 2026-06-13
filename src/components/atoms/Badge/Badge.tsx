/**
 * @fileoverview Badge component for status indicators and small labels.
 * @module components/atoms/Badge
 */

import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant of the badge */
  readonly variant?: BadgeVariant;
  /** Optional icon to display before the text */
  readonly icon?: ReactNode;
  /** Whether to use the subtle (light background) styling */
  readonly subtle?: boolean;
}

/**
 * Small indicator component for statuses, tags, or counts.
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', icon, subtle = true, className = '', children, ...props },
  ref
) {
  const classes = [
    styles.badge,
    styles[variant],
    subtle ? styles.subtle : styles.solid,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span ref={ref} className={classes} {...props}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
});

export default Badge;
