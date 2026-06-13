/**
 * @fileoverview RecommendationList organism for displaying AI recommendations.
 * @module components/organisms/RecommendationList
 */

import { memo } from 'react';
import { ActionCard } from '../ActionCard';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Lightbulb, Filter } from 'lucide-react';
import type { Recommendation, RecommendationCategory } from '../../../types';
import styles from './RecommendationList.module.css';

export interface RecommendationListProps {
  /** Array of recommendations to display */
  readonly recommendations: readonly Recommendation[];
  /** Callback when user clicks 'Mark as Done' */
  readonly onComplete?: (id: string) => void;
  /** Callback when user clicks to learn more or add as goal */
  readonly onAction?: (id: string) => void;
  /** Current active filter */
  readonly filter?: RecommendationCategory | 'all';
  /** Callback to change filter */
  readonly onFilterChange?: (filter: RecommendationCategory | 'all') => void;
  /** The user's highest emitting category */
  readonly highestCategory?: RecommendationCategory | 'none';
}

/**
 * Renders a list of AI recommendations with filtering.
 */
const RecommendationList = memo(function RecommendationList({
  recommendations,
  onComplete,
  onAction,
  filter = 'all',
  onFilterChange,
  highestCategory = 'none',
}: RecommendationListProps) {
  
  // Apply filtering
  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === filter);

  // Group by completed status
  const activeRecs = filteredRecs.filter(r => !r.completed);
  const completedRecs = filteredRecs.filter(r => r.completed);

  return (
    <div className={styles.container}>
      {/* Header & Filters */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Lightbulb className={styles.titleIcon} size={24} aria-hidden="true" />
          AI Recommendations
        </h2>
        
        {onFilterChange && (
          <div className={styles.filters} aria-label="Filter recommendations">
            <Filter size={16} className={styles.filterIcon} aria-hidden="true" />
            <select 
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as RecommendationCategory | 'all')}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="transport">Transport</option>
              <option value="diet">Diet</option>
              <option value="energy">Energy</option>
            </select>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredRecs.length === 0 && (
        <Card className={styles.emptyState} padding="lg">
          <div className={styles.emptyIcon} aria-hidden="true">
            <Lightbulb size={48} />
          </div>
          <h3>No recommendations found</h3>
          <p>We don't have any specific recommendations for this category yet.</p>
          {filter !== 'all' && onFilterChange && (
            <Button 
              variant="outline" 
              onClick={() => onFilterChange('all')}
              className={styles.clearFilterBtn}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Active Recommendations */}
      {activeRecs.length > 0 && (
        <div className={styles.list} role="list" aria-label="Active recommendations">
          {activeRecs.map(rec => (
            <div key={rec.id} role="listitem">
              <ActionCard 
                recommendation={rec}
                onComplete={onComplete}
                onAction={onAction}
                isHighImpact={rec.category === highestCategory}
              />
            </div>
          ))}
        </div>
      )}

      {/* Completed Recommendations */}
      {completedRecs.length > 0 && (
        <div className={styles.completedSection}>
          <h3 className={styles.completedTitle}>Completed Actions</h3>
          <div className={styles.list} role="list" aria-label="Completed recommendations">
            {completedRecs.map(rec => (
              <div key={rec.id} role="listitem">
                <ActionCard 
                  recommendation={rec}
                  onComplete={onComplete}
                  onAction={onAction}
                  isHighImpact={rec.category === highestCategory}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default RecommendationList;
