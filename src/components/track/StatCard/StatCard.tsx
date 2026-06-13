/**
 * @fileoverview StatCard component to display key metrics with trends.
 * @module components/molecules/StatCard
 */

import { memo } from 'react';
import { Card } from '../../atoms/Card';
import { Tooltip } from '../../atoms/Tooltip';
import styles from './StatCard.module.css';
import * as Icons from 'lucide-react';

export interface StatCardProps {
  /** Title of the statistic */
  readonly title: string;
  /** Primary value to display */
  readonly value: string | number;
  /** Name of the Lucide icon to display */
  readonly iconName?: keyof typeof Icons;
  /** Additional text below the value */
  readonly description?: string;
  /** Trend data */
  readonly trend?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    label: string;
  };
  /** Optional tooltip text for the info icon */
  readonly info?: string;
  /** Optional color theme for the card */
  readonly colorTheme?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Whether to use glassmorphism */
  readonly glass?: boolean;
}

/**
 * Molecule component to display a key metric, icon, and optional trend.
 */
const StatCard = memo(function StatCard({
  title,
  value,
  iconName,
  description,
  trend,
  info,
  colorTheme = 'primary',
  glass = false,
}: StatCardProps) {
  const Icon = iconName ? Icons[iconName] : null;
  const InfoIcon = Icons.Info;
  
  const trendIcon = trend?.direction === 'up' 
    ? <Icons.ArrowUpRight size={16} /> 
    : trend?.direction === 'down' 
      ? <Icons.ArrowDownRight size={16} /> 
      : <Icons.Minus size={16} />;

  return (
    <Card glass={glass} hoverable className={`${styles.card} ${styles[colorTheme]}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {info ? (
          <Tooltip content={info}>
            <button 
              type="button" 
              className={styles.infoButton} 
              aria-label={`More information about ${title}`}
            >
              <InfoIcon size={16} />
            </button>
          </Tooltip>
        ) : Icon ? (
          <div className={styles.iconWrapper} aria-hidden="true">
            {/* @ts-expect-error - Dynamic Icon rendering */}
            <Icon size={20} />
          </div>
        ) : null}
      </div>

      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        
        {(trend || description) && (
          <div className={styles.footer}>
            {trend && (
              <div 
                className={`${styles.trend} ${styles[`trend-${trend.direction}`]}`}
                aria-label={`${trend.direction === 'up' ? 'Increased' : trend.direction === 'down' ? 'Decreased' : 'Unchanged'} by ${trend.value}. ${trend.label}`}
              >
                {trendIcon}
                <span>{trend.value}</span>
              </div>
            )}
            
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

export default StatCard;
