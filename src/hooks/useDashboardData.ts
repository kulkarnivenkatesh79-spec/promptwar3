/**
 * @fileoverview Custom hook for deriving Dashboard data.
 * Enhances modularity by separating data transformation from presentation.
 * @module hooks/useDashboardData
 */

import { useMemo } from 'react';
import type { CarbonState, CarbonEntry } from '../types';
import { calculateEcoGrade } from '../utils/calculator';
import { formatTrend } from '../utils/formatters';

export interface ChartDataPoint {
  name: string;
  Total: number;
  Transport: number;
  Diet: number;
  Energy: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  currentEntry?: CarbonEntry;
  previousEntry?: CarbonEntry;
  chartData: ChartDataPoint[];
  categoryData: CategoryDataPoint[];
  ecoGrade: string | null;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
}

/**
 * Derives and formats state data specifically for Dashboard visualization.
 * @param {CarbonState} state - The global carbon state.
 * @returns {DashboardData} Formatted data ready for Recharts and stat cards.
 */
export function useDashboardData(state: CarbonState): DashboardData {
  const { currentEntry, previousEntry, chartData, categoryData, ecoGrade } = useMemo(() => {
    const sortedEntries = [...state.entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const latest = sortedEntries[sortedEntries.length - 1];
    const previous = sortedEntries[sortedEntries.length - 2];
    
    // Format chart data for the last 6 months
    const cData: ChartDataPoint[] = sortedEntries.slice(-6).map(entry => {
      const d = new Date(entry.date);
      return {
        name: d.toLocaleDateString('default', { month: 'short' }),
        Total: Math.round(entry.totalEmissions),
        Transport: Math.round(entry.transportEmissions),
        Diet: Math.round(entry.dietEmissions),
        Energy: Math.round(entry.energyEmissions),
      };
    });

    // Format category data for pie chart
    const catData: CategoryDataPoint[] = latest ? [
      { name: 'Transport', value: latest.transportEmissions, color: '#06b6d4' },
      { name: 'Diet', value: latest.dietEmissions, color: '#10b981' },
      { name: 'Energy', value: latest.energyEmissions, color: '#f59e0b' },
    ] : [];

    const grade = latest ? calculateEcoGrade(latest.totalEmissions / 1000) : null;

    return { 
      currentEntry: latest, 
      previousEntry: previous, 
      chartData: cData, 
      categoryData: catData,
      ecoGrade: grade
    };
  }, [state.entries]);

  const trend = useMemo(() => {
    if (!currentEntry || !previousEntry) return undefined;
    return formatTrend(currentEntry.totalEmissions, previousEntry.totalEmissions);
  }, [currentEntry, previousEntry]);

  return {
    currentEntry,
    previousEntry,
    chartData,
    categoryData,
    ecoGrade,
    trend
  };
}
