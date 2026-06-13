/**
 * @fileoverview Accessible SkipLink component for keyboard navigation.
 * Allows screen reader and keyboard users to skip navigation and jump to main content.
 * @module components/atoms/SkipLink
 */

import { type AnchorHTMLAttributes, forwardRef } from 'react';
import styles from './SkipLink.module.css';

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The ID of the element to skip to (without the #) */
  readonly targetId?: string;
}

/**
 * Visually hidden link that becomes visible when focused via keyboard.
 * Essential for WCAG AA compliance.
 */
const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { targetId = 'main-content', className = '', children = 'Skip to main content', ...props },
  ref
) {
  const classes = [styles.skipLink, className].filter(Boolean).join(' ');

  return (
    <a
      ref={ref}
      href={`#${targetId}`}
      className={classes}
      {...props}
    >
      {children}
    </a>
  );
});

export default SkipLink;
