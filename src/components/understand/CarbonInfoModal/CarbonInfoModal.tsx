/**
 * @fileoverview Modal component for explaining Carbon Equivalents (Understand pillar).
 * @module components/atoms/CarbonInfoModal
 */

import React from 'react';
import { X, Info, Car, TreePine, Lightbulb } from 'lucide-react';
import styles from './CarbonInfoModal.module.css';

interface CarbonInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTonnes: number;
}

/**
 * Renders an accessible modal explaining what carbon equivalents mean.
 * Satisfies the "Understand" alignment pillar.
 * 
 * @param {CarbonInfoModalProps} props - Component properties.
 * @returns {JSX.Element | null} Modal component or null if not open.
 */
export const CarbonInfoModal: React.FC<CarbonInfoModalProps> = ({ isOpen, onClose, totalTonnes }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Info className={styles.icon} size={24} />
            <h1 id="modal-title" className={styles.title}>Pillar 1: Understand Your Footprint</h1>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Close understand modal"
            tabIndex={0}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.intro}>
            Your estimated annual footprint is <strong>{totalTonnes.toFixed(2)} Tonnes of CO2</strong>. 
            But what does that actually mean? Here are some real-world equivalents:
          </p>
          
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <Car className={styles.listIcon} size={20} />
              <span>Equivalent to driving an average gasoline car for <strong>{(totalTonnes * 2500).toLocaleString()} miles</strong>.</span>
            </li>
            <li className={styles.listItem}>
              <Lightbulb className={styles.listIcon} size={20} />
              <span>Equivalent to the energy used by an average smartphone charged <strong>{(totalTonnes * 121000).toLocaleString()} times</strong>.</span>
            </li>
            <li className={styles.listItem}>
              <TreePine className={styles.listIcon} size={20} />
              <span>It would take <strong>{Math.ceil(totalTonnes * 50)} mature trees</strong> a full year to absorb this amount of CO2.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
