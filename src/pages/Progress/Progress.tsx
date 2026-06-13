/**
 * @fileoverview Progress Page
 * Displays active goals, historical data, and environmental impact metrics.
 * @module pages/Progress
 */

import { useMemo } from 'react';
import { useCarbonContext } from '../../context/CarbonContext';
import { GoalCard } from '../../components/molecules/GoalCard';
import { Card } from '../../components/atoms/Card';
import { formatCO2 } from '../../utils/formatters';
import { Target, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import styles from './Progress.module.css';

export default function Progress() {
  const { state } = useCarbonContext();

  const currentEntry = useMemo(() => {
    if (state.entries.length === 0) return null;
    return [...state.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [state.entries]);

  const chartData = useMemo(() => {
    const sortedEntries = [...state.entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Take last 6 entries
    return sortedEntries.slice(-6).map(entry => {
      const d = new Date(entry.date);
      return {
        name: d.toLocaleDateString('default', { month: 'short' }),
        Transport: Math.round(entry.transportEmissions),
        Diet: Math.round(entry.dietEmissions),
        Energy: Math.round(entry.energyEmissions),
      };
    });
  }, [state.entries]);

  const { activeGoals, achievedGoals } = useMemo(() => {
    return {
      activeGoals: state.goals.filter(g => !g.achieved),
      achievedGoals: state.goals.filter(g => g.achieved)
    };
  }, [state.goals]);

  // Total impact calculations
  const totalSavings = useMemo(() => {
    return state.activityLog.reduce((acc: number, act) => acc + (act.impactKg < 0 ? Math.abs(act.impactKg) : 0), 0);
  }, [state.activityLog]);

  const treeEquivalent = Math.floor(totalSavings / 21); // ~21kg CO2 per mature tree per year

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Progress & Goals</h1>
          <p className={styles.subtitle}>Track your sustainability journey over time.</p>
        </div>
      </header>

      {/* Impact Summary */}
      <div className={styles.impactGrid}>
        <Card className={styles.impactCard} padding="lg">
          <div className={styles.impactIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <Trophy size={28} />
          </div>
          <div className={styles.impactContent}>
            <span className={styles.impactLabel}>Lifetime Reductions</span>
            <span className={styles.impactValue}>{formatCO2(totalSavings)}</span>
          </div>
        </Card>
        
        <Card className={styles.impactCard} padding="lg">
          <div className={styles.impactIconWrapper} style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Target size={28} />
          </div>
          <div className={styles.impactContent}>
            <span className={styles.impactLabel}>Goals Achieved</span>
            <span className={styles.impactValue}>{achievedGoals.length}</span>
          </div>
        </Card>

        <Card className={styles.impactCard} padding="lg">
          <div className={styles.impactIconWrapper} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <TrendingUp size={28} />
          </div>
          <div className={styles.impactContent}>
            <span className={styles.impactLabel}>Tree Equivalent</span>
            <span className={styles.impactValue}>{treeEquivalent} Trees</span>
          </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Historical Chart */}
        <div className={styles.chartColumn}>
          <Card className={styles.chartCard} padding="lg">
            <h2 className={styles.sectionTitle}>Historical Footprint</h2>
            
            {chartData.length > 0 ? (
              <div className={styles.chartContainer} aria-label="Stacked bar chart showing historical emissions by category">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      cursor={{ fill: 'var(--color-surface-hover)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Transport" stackId="a" fill="#06b6d4" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Diet" stackId="a" fill="#10b981" />
                    <Bar dataKey="Energy" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={styles.emptyChart}>
                <Calendar size={48} className={styles.emptyIcon} />
                <p>Calculate your footprint multiple times to see historical trends.</p>
              </div>
            )}
          </Card>
          
          {/* Recent Activity */}
          <Card padding="lg" className={styles.activityCard}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            {state.activityLog.length > 0 ? (
              <ul className={styles.activityList}>
                {state.activityLog.slice(0, 5).map(activity => (
                  <li key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIndicator} />
                    <div className={styles.activityInfo}>
                      <span className={styles.activityAction}>{activity.action}</span>
                      <span className={styles.activityDate}>
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.impactKg !== 0 && (
                      <span className={`${styles.activityImpact} ${activity.impactKg < 0 ? styles.positiveImpact : styles.negativeImpact}`}>
                        {activity.impactKg > 0 ? '+' : ''}{activity.impactKg}kg
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>No recent activity recorded.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Goals */}
        <div className={styles.goalsColumn}>
          <div className={styles.goalsHeader}>
            <h2 className={styles.sectionTitle}>Active Goals</h2>
          </div>
          
          <div className={styles.goalsList}>
            {activeGoals.length > 0 ? (
              activeGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  currentEmissionsKg={currentEntry?.totalEmissions ?? 0}
                />
              ))
            ) : (
              <Card className={styles.emptyGoals}>
                <Target size={32} className={styles.emptyIcon} />
                <h3>No active goals</h3>
                <p>Set goals from the Recommendations page to start tracking your reduction targets.</p>
              </Card>
            )}
          </div>
          
          {achievedGoals.length > 0 && (
            <div className={styles.achievedSection}>
              <h2 className={styles.sectionTitle}>Achieved Goals</h2>
              <div className={styles.goalsList}>
                {achievedGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    currentEmissionsKg={currentEntry?.totalEmissions ?? 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
