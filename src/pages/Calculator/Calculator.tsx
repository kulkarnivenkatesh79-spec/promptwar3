/**
 * @fileoverview Calculator Page
 * Hosts the multi-step calculator form.
 * @module pages/Calculator
 */

import { CalculatorForm } from '../../components/organisms/CalculatorForm';
import styles from './Calculator.module.css';

export default function Calculator() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Footprint Calculator</h1>
        <p className={styles.subtitle}>
          Answer a few quick questions to estimate your carbon footprint. 
          Your data is saved locally for your privacy.
        </p>
      </div>
      
      <div className={styles.formWrapper}>
        <CalculatorForm />
      </div>
    </div>
  );
}
