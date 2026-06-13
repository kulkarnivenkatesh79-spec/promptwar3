/**
 * @fileoverview Personalized Insights Engine (Recommendations Page).
 * Satisfies the "Reduce" alignment pillar by offering dynamic, actionable insights.
 * @module pages/Recommendations
 */

import { useState, useMemo } from 'react';
import { useCarbonContext } from '../../context/CarbonContext';
import { RecommendationList } from '../../components/organisms/RecommendationList';
import { Card } from '../../components/atoms/Card';
import { generateRecommendations } from '../../utils/recommendations';
import { formatCO2, formatPercentage } from '../../utils/formatters';
import { CarbonActionType, type RecommendationCategory } from '../../types';
import { Sparkles, ArrowDown } from 'lucide-react';
import styles from './Recommendations.module.css';

/**
 * Personalized Insights Engine page component.
 * @returns The rendered insights page.
 */
export default function Recommendations() {
  const { state, dispatch } = useCarbonContext();
  const [filter, setFilter] = useState<RecommendationCategory | 'all'>('all');

  // We use the latest entry to generate recommendations
  const currentEntry = useMemo(() => {
    if (state.entries.length === 0) return null;
    return [...state.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [state.entries]);

  // Generate recommendations using the AI engine
  const recommendations = useMemo(() => {
    if (!currentEntry) return [];
    
    // Get completed IDs from state
    const completedIds = state.recommendations
      .filter(r => r.completed)
      .map(r => r.id);
      
    return generateRecommendations(currentEntry, completedIds);
  }, [currentEntry, state.recommendations]);

  // Calculate potential impact
  const potentialSavings = useMemo(() => {
    if (!currentEntry) return 0;
    
    // Sum up estimated savings of uncompleted recommendations (top 3 for realistic scenario)
    const topUncompleted = recommendations
      .filter(r => !r.completed)
      .slice(0, 3);
      
    return topUncompleted.reduce((acc, rec) => acc + (rec.estimatedSavingsTonnes * 1000), 0);
  }, [currentEntry, recommendations]);

  const handleComplete = (id: string) => {
    dispatch({ type: CarbonActionType.ToggleRecommendation, payload: id });
    
    // Find the recommendation to log the activity
    const rec = recommendations.find(r => r.id === id);
    if (rec) {
      dispatch({ 
        type: CarbonActionType.AddActivity, 
        payload: {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: `Completed: ${rec.title}`,
          category: rec.category,
          impactKg: -(rec.estimatedSavingsTonnes * 1000)
        }
      });
    }
  };

  const handleAction = (id: string) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec) return;
    
    // Set a new goal based on this recommendation
    const newGoal = {
      id: `goal_${Date.now()}`,
      description: rec.title,
      targetTonnes: Math.max(0.5, (currentEntry?.totalEmissions ?? 5000) / 1000 - rec.estimatedSavingsTonnes),
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      achieved: false
    };
    
    dispatch({ type: CarbonActionType.AddGoal, payload: newGoal });
    
    // Create a temporary notification (in a real app we'd use a toast context)
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
          <h1 className={styles.title}>Personalized Insights Engine</h1>
          <p className={styles.subtitle}>AI-driven recommendations to help you reduce your carbon footprint.</p>
        </div>
      </header>

      {/* Simulator / Potential Impact */}
      {potentialSavings > 0 && (
        <Card className={styles.simulatorCard} padding="lg">
          <div className={styles.simulatorContent}>
            <div className={styles.simulatorIconWrapper}>
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
                <ArrowDown size={20} />
                {formatCO2(potentialSavings)}
              </div>
              <div className={styles.savingsPercent}>
                {formatPercentage(potentialReductionPercent)} reduction
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendation List */}
      <RecommendationList 
        recommendations={recommendations}
        filter={filter}
        onFilterChange={setFilter}
        onComplete={handleComplete}
        onAction={handleAction}
      />
    </div>
  );
}
