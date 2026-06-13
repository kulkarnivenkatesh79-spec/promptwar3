/**
 * @fileoverview AI Recommendation Engine.
 * Analyzes carbon footprint data to generate personalized, prioritized recommendations.
 * @module utils/recommendations
 */

import { type CarbonEntry, type Recommendation, RecommendationCategory } from '../types';
import { RECOMMENDATION_TEMPLATES } from './constants';

/**
 * Identifies the category with the highest emissions.
 * 
 * @param entry - Carbon footprint entry
 * @returns The top emission category
 */
export function getTopCategory(entry: CarbonEntry): RecommendationCategory {
  const { transportEmissions, dietEmissions, energyEmissions } = entry;
  
  if (transportEmissions >= dietEmissions && transportEmissions >= energyEmissions) {
    return RecommendationCategory.Transport;
  }
  if (dietEmissions >= transportEmissions && dietEmissions >= energyEmissions) {
    return RecommendationCategory.Diet;
  }
  return RecommendationCategory.Energy;
}

/**
 * Calculates a priority score (0-100) for a recommendation based on user's footprint.
 * 
 * @param recommendation - The recommendation template
 * @param entry - User's current carbon entry
 * @returns Priority score from 0 to 100
 */
export function calculatePriorityScore(
  recommendation: Omit<Recommendation, 'priorityScore' | 'completed'>, 
  entry: CarbonEntry
): number {
  let score = 50; // Base score
  
  const topCategory = getTopCategory(entry);
  
  // 1. Relevance: +20 if it targets their biggest emission source
  if (recommendation.category === topCategory) {
    score += 20;
  }
  
  // 2. Impact: up to +30 based on potential savings relative to total emissions
  // Convert tonnes to kg for comparison
  const savingsKg = recommendation.estimatedSavingsTonnes * 1000;
  const impactRatio = savingsKg / Math.max(1, entry.totalEmissions); // Avoid division by zero
  
  // Cap impact bonus at 30 points
  const impactScore = Math.min(30, impactRatio * 100);
  score += impactScore;
  
  // 3. Difficulty: easy (+10), medium (0), hard (-10)
  // We want to recommend easier things first to build momentum
  if (recommendation.difficulty === 'easy') score += 10;
  if (recommendation.difficulty === 'hard') score -= 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyzes footprint and returns personalized, prioritized recommendations.
 * 
 * @param entry - Current carbon entry
 * @param completedIds - IDs of recommendations user has already completed
 * @returns Array of prioritized recommendations
 */
export function generateRecommendations(
  entry: CarbonEntry,
  completedIds: string[] = []
): Recommendation[] {
  // If no entry data yet, return generic sorting
  if (!entry || entry.totalEmissions === 0) {
    return RECOMMENDATION_TEMPLATES.map(template => ({
      ...template,
      priorityScore: 50,
      completed: completedIds.includes(template.id)
    }));
  }

  const recommendations = RECOMMENDATION_TEMPLATES.map(template => {
    return {
      ...template,
      priorityScore: calculatePriorityScore(template, entry),
      completed: completedIds.includes(template.id)
    };
  });

  // Sort by score descending
  return recommendations.sort((a, b) => {
    // Put completed items at the bottom regardless of score
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    return b.priorityScore - a.priorityScore;
  }).slice(0, 8); // Return top 8
}

/**
 * Estimates new total footprint if specified recommendations are followed.
 * 
 * @param entry - Current carbon entry
 * @param completedRecommendationIds - IDs of recommendations to simulate
 * @returns Estimated new total in kg CO2
 */
export function simulateReduction(
  entry: CarbonEntry, 
  completedRecommendationIds: string[]
): number {
  if (!entry || entry.totalEmissions === 0) return 0;
  
  let totalSavingsKg = 0;
  
  completedRecommendationIds.forEach(id => {
    const rec = RECOMMENDATION_TEMPLATES.find(r => r.id === id);
    if (rec) {
      totalSavingsKg += rec.estimatedSavingsTonnes * 1000;
    }
  });
  
  return Math.max(0, entry.totalEmissions - totalSavingsKg);
}
