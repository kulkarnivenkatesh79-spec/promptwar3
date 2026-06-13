/**
 * @fileoverview ActionCard component for displaying AI recommendations.
 * @module components/molecules/ActionCard
 */

import { memo } from 'react';
import { Card } from '../../atoms/Card';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import * as Icons from 'lucide-react';
import type { Recommendation } from '../../../types';
import styles from './ActionCard.module.css';

export interface ActionCardProps {
  /** The recommendation to display */
  readonly recommendation: Recommendation;
  /** Callback when user clicks 'Mark as Done' */
  readonly onComplete?: (id: string) => void;
  /** Callback when user clicks to learn more or add as goal */
  readonly onAction?: (id: string) => void;
  /** Whether this action maps to the user's highest emitting category */
  readonly isHighImpact?: boolean;
}

/**
 * Displays an AI-generated recommendation with actions.
 */
const ActionCard = memo(function ActionCard({
  recommendation,
  onComplete,
  onAction,
  isHighImpact,
}: ActionCardProps) {
  // @ts-expect-error - Dynamic icon mapping
  const Icon = recommendation.icon ? Icons[recommendation.icon] : Icons.Lightbulb;
  
  const isCompleted = recommendation.completed;
  
  // Determine impact color
  let impactColor: 'success' | 'warning' | 'primary' = 'primary';
  if (recommendation.estimatedSavingsTonnes >= 1.5) impactColor = 'success'; // High impact
  else if (recommendation.estimatedSavingsTonnes >= 0.5) impactColor = 'warning'; // Medium impact

  // Format savings
  const savingsText = `${recommendation.estimatedSavingsTonnes} tonnes CO₂/yr`;

  return (
    <Card 
      className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
      padding="lg"
    >
      <div className={styles.layout}>
        <div className={styles.iconColumn}>
          <div className={`${styles.iconWrapper} ${styles[recommendation.category]}`} aria-hidden="true">
            <Icon size={24} />
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <div className={styles.header}>
            <div className={styles.badges}>
              <Badge variant={impactColor} subtle={false}>
                Save {savingsText}
              </Badge>
              <Badge variant="neutral">
                {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
              </Badge>
              {isHighImpact && (
                <Badge variant="danger" icon={<Icons.Zap size={12} />}>
                  High Impact Action
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="success" icon={<Icons.Check size={12} />}>
                  Done
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className={styles.title}>{recommendation.title}</h3>
          <p className={styles.description}>{recommendation.description}</p>
          
          {!isCompleted && (
            <div className={styles.actions}>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onComplete?.(recommendation.id)}
                leftIcon={<Icons.Check size={16} />}
              >
                Mark as Done
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAction?.(recommendation.id)}
                leftIcon={<Icons.Target size={16} />}
              >
                Set as Goal
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

export default ActionCard;
