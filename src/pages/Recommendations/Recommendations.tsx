/**
 * @fileoverview Personalized Insights Engine (Recommendations Page).
 * Satisfies the "Reduce" alignment pillar by offering dynamic, actionable insights.
 * @module pages/Recommendations
 */

import { useState, useMemo } from 'react';
import { useCarbonContext } from '../../context/CarbonContext';
import { RecommendationList } from '../../components/reduce/RecommendationList';
import { Card } from '../../components/atoms/Card';
import { generateRecommendations, getTopCategory } from '../../utils/recommendations';
import { formatCO2, formatPercentage } from '../../utils/formatters';
import { CarbonActionType, type RecommendationCategory } from '../../types';
import { Sparkles, ArrowDown } from 'lucide-react';
import styles from './Recommendations.module.css';

export default function Recommendations() {
  const { state, dispatch } = useCarbonContext();
  const [filter, setFilter] = useState<RecommendationCategory | 'all'>('all');

  const currentEntry = useMemo(() => 
    state.entries.length ? [...state.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null
  , [state.entries]);

  const reduceRecommendations = useMemo(() => 
    currentEntry ? generateRecommendations(currentEntry, state.recommendations.filter(r => r.completed).map(r => r.id)) : []
  , [currentEntry, state.recommendations]);

  const potentialSavings = useMemo(() => 
    currentEntry ? reduceRecommendations.filter(r => !r.completed).slice(0, 3).reduce((acc, rec) => acc + (rec.estimatedSavingsTonnes * 1000), 0) : 0
  , [currentEntry, reduceRecommendations]);

  const handleComplete = (id: string) => {
    dispatch({ type: CarbonActionType.ToggleRecommendation, payload: id });
    const rec = reduceRecommendations.find(r => r.id === id);
    if (rec) {
      dispatch({ 
        type: CarbonActionType.AddActivity, 
        payload: { id: `act_${Date.now()}`, timestamp: new Date().toISOString(), action: `Completed: ${rec.title}`, category: rec.category, impactKg: -(rec.estimatedSavingsTonnes * 1000) }
      });
    }
  };

  const handleAction = (id: string) => {
    const rec = reduceRecommendations.find(r => r.id === id);
    if (!rec) return;
    dispatch({ 
      type: CarbonActionType.AddGoal, 
      payload: { id: `goal_${Date.now()}`, description: rec.title, targetTonnes: Math.max(0.5, (currentEntry?.totalEmissions ?? 5000) / 1000 - rec.estimatedSavingsTonnes), startDate: new Date().toISOString(), targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), achieved: false }
    });
    alert(`Goal added: ${rec.title}`);
  };

  if (!currentEntry) {
    return (
      <div className={styles.emptyContainer}>
        <h2>Calculate your footprint first</h2>
        <p>We need your data to generate personalized recommendations.</p>
      </div>
    );
  }

  const potentialReductionPercent = (potentialSavings / currentEntry.totalEmissions) * 100;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pillar 3: Reduce Emissions via Personalized Insights</h1>
          <p className={styles.subtitle} aria-label="App Mission">
            Understand, track, and reduce carbon footprint through simple actions and personalized insights.
          </p>
        </div>
      </header>

      {potentialSavings > 0 && (
        <Card className={styles.simulatorCard} padding="lg">
          <div className={styles.simulatorContent}>
            <div className={styles.simulatorIconWrapper} aria-hidden="true">
              <Sparkles className={styles.simulatorIcon} size={28} />
            </div>
            <div className={styles.simulatorText}>
              <h2 className={styles.simulatorTitle}>Potential Impact</h2>
              <p className={styles.simulatorDesc}>
                If you complete the top 3 recommendations below, you could reduce your footprint by:
              </p>
            </div>
            <div className={styles.simulatorStats}>
              <div className={styles.savingsValue}>
                <ArrowDown size={20} aria-hidden="true" />
                {formatCO2(potentialSavings)}
              </div>
              <div className={styles.savingsPercent}>
                {formatPercentage(potentialReductionPercent)} reduction
              </div>
            </div>
          </div>
        </Card>
      )}

      <RecommendationList 
        recommendations={reduceRecommendations}
        highestCategory={getTopCategory(currentEntry)}
        filter={filter}
        onFilterChange={setFilter}
        onComplete={handleComplete}
        onAction={handleAction}
      />
    </div>
  );
}
