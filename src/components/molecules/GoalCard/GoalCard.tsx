/**
 * @fileoverview GoalCard component to display progress towards a user goal.
 * @module components/molecules/GoalCard
 */

import { memo } from 'react';
import { Card } from '../../atoms/Card';
import { ProgressBar } from '../../atoms/ProgressBar';
import { Badge } from '../../atoms/Badge';
import { Target, CheckCircle2, Calendar } from 'lucide-react';
import { formatDate, formatCO2 } from '../../../utils/formatters';
import type { Goal } from '../../../types';
import styles from './GoalCard.module.css';

export interface GoalCardProps {
  /** The goal data object */
  readonly goal: Goal;
  /** Current emissions value to compare against goal */
  readonly currentEmissionsKg: number;
  /** Optional callback when goal is clicked */
  readonly onClick?: (id: string) => void;
}

/**
 * Displays a goal with progress tracking.
 */
const GoalCard = memo(function GoalCard({
  goal,
  currentEmissionsKg,
  onClick,
}: GoalCardProps) {
  const targetKg = goal.targetTonnes * 1000;
  
  // Calculate progress (0% if current is double target, 100% if current <= target)
  // Progress is better when current is closer to target
  let progressPercent = 0;
  if (currentEmissionsKg <= targetKg) {
    progressPercent = 100;
  } else {
    // How much over target are we?
    const excess = currentEmissionsKg - targetKg;
    // Assume starting point was current emissions when goal was set (we'll use a 2x target heuristic if not available)
    const baseline = targetKg * 2; 
    const startingExcess = baseline - targetKg;
    
    // Progress = 100 - (current excess / starting excess * 100)
    progressPercent = Math.max(0, 100 - (excess / startingExcess) * 100);
  }

  const isAchieved = goal.achieved || currentEmissionsKg <= targetKg;
  const isOverdue = new Date(goal.targetDate) < new Date() && !isAchieved;

  const handleClick = () => {
    if (onClick) onClick(goal.id);
  };

  return (
    <Card 
      className={styles.card} 
      hoverable={!!onClick}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(goal.id);
        }
      }}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Target size={18} className={styles.icon} aria-hidden="true" />
          <h3 className={styles.title}>{goal.description}</h3>
        </div>
        <Badge 
          variant={isAchieved ? 'success' : isOverdue ? 'danger' : 'primary'}
          icon={isAchieved ? <CheckCircle2 size={12} /> : undefined}
        >
          {isAchieved ? 'Achieved' : isOverdue ? 'Overdue' : 'In Progress'}
        </Badge>
      </div>

      <div className={styles.targets}>
        <div className={styles.targetCol}>
          <span className={styles.label}>Current</span>
          <span className={`${styles.value} ${isAchieved ? styles.successValue : ''}`}>
            {formatCO2(currentEmissionsKg)}
          </span>
        </div>
        <div className={styles.targetCol}>
          <span className={styles.label}>Target</span>
          <span className={styles.value}>{formatCO2(targetKg)}</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <ProgressBar 
          value={progressPercent} 
          variant={isAchieved ? 'success' : 'primary'} 
          ariaLabel={`Progress towards goal: ${goal.description}`}
        />
        <div className={styles.footer}>
          <div className={styles.dateInfo}>
            <Calendar size={14} className={styles.dateIcon} aria-hidden="true" />
            <span>Target: {formatDate(goal.targetDate)}</span>
          </div>
          <span className={styles.progressText}>
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </Card>
  );
});

export default GoalCard;
