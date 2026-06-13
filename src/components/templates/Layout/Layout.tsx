/**
 * @fileoverview Main application layout wrapper.
 * Includes Navbar and main content area with proper accessibility markup.
 * @module components/templates/Layout
 */

import { type ReactNode } from 'react';
import { Navbar } from '../../organisms/Navbar';
import styles from './Layout.module.css';

export interface LayoutProps {
  readonly children: ReactNode;
}

/**
 * Main application layout template.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Navbar />
      
      {/* Main content area marked for screen readers and skip links */}
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>© {new Date().getFullYear()} EcoTrack Carbon Awareness Platform.</p>
          <p className={styles.subtext}>A hackathon project for Challenge 3: Carbon Footprint.</p>
        </div>
      </footer>
    </div>
  );
}
