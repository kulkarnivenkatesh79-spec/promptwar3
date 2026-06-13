/**
 * @fileoverview Multi-step Calculator Form organism.
 * Handles state for transport, diet, and energy inputs.
 * @module components/organisms/CalculatorForm
 */

import { useState, useCallback, useEffect } from 'react';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { CategorySlider } from '../../molecules/CategorySlider';
import { TransportMode, DietType, EnergySource, type CarbonEntry } from '../../../types';
import { useCarbonContext } from '../../../context/CarbonContext';
import { calculateTotalEmissions, calculateTransportEmissions, calculateDietEmissions, calculateEnergyEmissions, generateId } from '../../../utils/calculator';
import { TRANSPORT_LABELS, DIET_LABELS } from '../../../utils/constants';
import { CarbonActionType } from '../../../types';
import * as Icons from 'lucide-react';
import styles from './CalculatorForm.module.css';
import { useNavigate } from 'react-router-dom';

/**
 * Main calculator wizard form.
 */
export default function CalculatorForm() {
  const { dispatch } = useCarbonContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [transportMode, setTransportMode] = useState<TransportMode>(TransportMode.CarGasoline);
  const [distanceKm, setDistanceKm] = useState(150);
  const [frequency, setFrequency] = useState(5);

  const [dietType, setDietType] = useState<DietType>(DietType.Average);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [foodWaste, setFoodWaste] = useState(20);

  const [electricityKwh, setElectricityKwh] = useState(900);
  const [naturalGasTherms, setNaturalGasTherms] = useState(50);
  const [heatingOilGallons, setHeatingOilGallons] = useState(0);

  // Live calculation for preview
  const [liveTotal, setLiveTotal] = useState(0);

  // Update live preview when inputs change
  useEffect(() => {
    const transportTotal = calculateTransportEmissions([{
      id: 'preview',
      mode: transportMode,
      distanceKm,
      frequencyPerWeek: frequency
    }]);
    
    const dietTotal = calculateDietEmissions({
      dietType,
      mealsPerDay,
      foodWastePercent: foodWaste
    });
    
    const energyTotal = calculateEnergyEmissions({
      electricityKwh,
      electricitySource: EnergySource.ElectricityUS,
      naturalGasTherms,
      heatingOilGallons
    });
    
    setLiveTotal(calculateTotalEmissions(transportTotal, dietTotal, energyTotal));
  }, [transportMode, distanceKm, frequency, dietType, mealsPerDay, foodWaste, electricityKwh, naturalGasTherms, heatingOilGallons]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3) as 1 | 2 | 3);
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Create new entry
      const transportEntries = [{
        id: generateId(),
        mode: transportMode,
        distanceKm,
        frequencyPerWeek: frequency
      }];
      
      const dietConfig = {
        dietType,
        mealsPerDay,
        foodWastePercent: foodWaste
      };
      
      const energyUsage = {
        electricityKwh,
        electricitySource: EnergySource.ElectricityUS,
        naturalGasTherms,
        heatingOilGallons
      };
      
      const transportEmissions = calculateTransportEmissions(transportEntries);
      const dietEmissions = calculateDietEmissions(dietConfig);
      const energyEmissions = calculateEnergyEmissions(energyUsage);
      const totalEmissions = calculateTotalEmissions(transportEmissions, dietEmissions, energyEmissions);
      
      const entry: CarbonEntry = {
        id: generateId(),
        date: new Date().toISOString(),
        transportEmissions,
        dietEmissions,
        energyEmissions,
        totalEmissions,
        transportEntries,
        dietConfig,
        energyUsage
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      dispatch({ type: CarbonActionType.AddEntry, payload: entry });
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Failed to save calculation', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [transportMode, distanceKm, frequency, dietType, mealsPerDay, foodWaste, electricityKwh, naturalGasTherms, heatingOilGallons, dispatch, navigate]);

  return (
    <div className={styles.container}>
      {/* Step Indicator */}
      <div className={styles.stepper} aria-label="Calculator Progress">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ''}`}>
            <div className={styles.stepCircle} aria-current={step === s ? 'step' : undefined}>
              {step > s ? <Icons.Check size={16} /> : s}
            </div>
            <span className={styles.stepLabel}>
              {s === 1 ? 'Transport' : s === 2 ? 'Diet' : 'Energy'}
            </span>
            {s < 3 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <Card className={styles.formCard} padding="lg">
        {/* Step 1: Transport */}
        {step === 1 && (
          <div className={styles.stepContent} role="tabpanel" aria-labelledby="step-1-label">
            <h2 id="step-1-label" className={styles.stepTitle}>
              <Icons.Car className={styles.titleIcon} color="var(--color-primary)" />
              Transportation Habits
            </h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="transportMode" className={styles.selectLabel}>Primary Transport Mode</label>
              <select 
                id="transportMode"
                className={styles.select}
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as TransportMode)}
              >
                {Object.entries(TRANSPORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <CategorySlider
              label="Weekly Distance"
              value={distanceKm}
              min={0}
              max={1000}
              step={10}
              onChange={setDistanceKm}
              unit="km/wk"
              colorTheme="transport"
              ariaDescription="Adjust your typical weekly travel distance"
            />
            
            <CategorySlider
              label="Frequency (Days per Week)"
              value={frequency}
              min={0}
              max={7}
              step={1}
              onChange={setFrequency}
              unit="days/wk"
              colorTheme="transport"
            />
          </div>
        )}

        {/* Step 2: Diet */}
        {step === 2 && (
          <div className={styles.stepContent} role="tabpanel" aria-labelledby="step-2-label">
            <h2 id="step-2-label" className={styles.stepTitle}>
              <Icons.Utensils className={styles.titleIcon} color="var(--color-success)" />
              Dietary Choices
            </h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="dietType" className={styles.selectLabel}>Primary Diet Type</label>
              <select 
                id="dietType"
                className={styles.select}
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
              >
                {Object.entries(DIET_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <CategorySlider
              label="Meals per Day"
              value={mealsPerDay}
              min={1}
              max={6}
              step={1}
              onChange={setMealsPerDay}
              unit="meals"
              colorTheme="diet"
            />
            
            <CategorySlider
              label="Estimated Food Waste"
              value={foodWaste}
              min={0}
              max={50}
              step={5}
              onChange={setFoodWaste}
              unit="%"
              colorTheme="diet"
              ariaDescription="Percentage of food purchased that goes uneaten"
            />
          </div>
        )}

        {/* Step 3: Energy */}
        {step === 3 && (
          <div className={styles.stepContent} role="tabpanel" aria-labelledby="step-3-label">
            <h2 id="step-3-label" className={styles.stepTitle}>
              <Icons.Zap className={styles.titleIcon} color="var(--color-warning)" />
              Home Energy Usage
            </h2>
            
            <CategorySlider
              label="Monthly Electricity"
              value={electricityKwh}
              min={0}
              max={3000}
              step={50}
              onChange={setElectricityKwh}
              unit="kWh/mo"
              colorTheme="energy"
            />
            
            <CategorySlider
              label="Natural Gas Usage"
              value={naturalGasTherms}
              min={0}
              max={200}
              step={5}
              onChange={setNaturalGasTherms}
              unit="therms/mo"
              colorTheme="energy"
            />
            
            <CategorySlider
              label="Heating Oil"
              value={heatingOilGallons}
              min={0}
              max={150}
              step={5}
              onChange={setHeatingOilGallons}
              unit="gal/mo"
              colorTheme="energy"
            />
          </div>
        )}

        {/* Live Preview Bar */}
        <div className={styles.livePreview} aria-live="polite">
          <span className={styles.previewLabel}>Estimated Footprint:</span>
          <span className={styles.previewValue}>{(liveTotal / 1000).toFixed(2)} tonnes/yr</span>
        </div>

        {/* Navigation Buttons */}
        <div className={styles.formActions}>
          <Button 
            variant="ghost" 
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            leftIcon={<Icons.ArrowLeft size={16} />}
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button 
              variant="primary" 
              onClick={handleNext}
              rightIcon={<Icons.ArrowRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<Icons.Save size={16} />}
            >
              Save Results
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
