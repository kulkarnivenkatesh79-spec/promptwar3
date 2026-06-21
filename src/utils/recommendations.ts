import { type CarbonEntry, type Recommendation, RecommendationCategory } from '../types';
import { RECOMMENDATION_TEMPLATES } from './constants';
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
export function calculatePriorityScore(
  recommendation: Omit<Recommendation, 'priorityScore' | 'completed'>, 
  entry: CarbonEntry
): number {
  let score = 50; 
  const topCategory = getTopCategory(entry);
  if (recommendation.category === topCategory) {
    score += 20;
  }
  const savingsKg = recommendation.estimatedSavingsTonnes * 1000;
  const impactRatio = savingsKg / Math.max(1, entry.totalEmissions); 
  const impactScore = Math.min(30, impactRatio * 100);
  score += impactScore;
  if (recommendation.difficulty === 'easy') score += 10;
  if (recommendation.difficulty === 'hard') score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}
export function generateRecommendations(
  entry: CarbonEntry,
  completedIds: string[] = []
): Recommendation[] {
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
  return recommendations.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return b.priorityScore - a.priorityScore;
  }).slice(0, 8); 
}
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
