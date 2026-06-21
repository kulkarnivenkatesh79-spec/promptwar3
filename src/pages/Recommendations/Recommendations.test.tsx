import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Recommendations from './Recommendations';
import { CarbonProvider } from '../../context/CarbonContext';
import { type CarbonState, RecommendationCategory } from '../../types';

describe('Recommendations Page', () => {
  const baseProfile = {
    name: 'Test User',
    region: 'global' as const,
    currency: 'USD',
    onboarded: true,
    joinDate: '2026-01-01',
  };

  const mockStateWithData: CarbonState = {
    profile: baseProfile,
    currentEntry: null,
    recommendations: [
      {
        id: 'r1',
        title: 'Plant-based diet',
        description: 'Eat more plants',
        category: RecommendationCategory.Diet,
        estimatedSavingsTonnes: 0.2,
        difficulty: 'medium' as any,
        priorityScore: 80,
        completed: false,
        icon: 'leaf',
      } as any
    ],
    entries: [
      {
        id: '1',
        date: '2026-06-01',
        totalEmissions: 1000,
        transportEmissions: 300,
        dietEmissions: 400,
        energyEmissions: 300,
      } as unknown as any
    ],
    goals: [],
    activityLog: [],
    isLoading: false,
  };


  const mockStateEmpty: CarbonState = {
    profile: baseProfile,
    currentEntry: null,
    recommendations: [],
    entries: [],
    goals: [],
    activityLog: [],
    isLoading: false,
  };

  const renderRecommendations = (state: CarbonState) => {
    window.localStorage.setItem('carbon_footprint_data', JSON.stringify(state));
    return render(
      <BrowserRouter>
        <CarbonProvider>
          <Recommendations />
        </CarbonProvider>
      </BrowserRouter>
    );
  };

  it('renders empty state when no data exists', () => {
    renderRecommendations(mockStateEmpty);
    expect(screen.getByText('Calculate your footprint first')).toBeDefined();
    expect(screen.getByText(/We need your data to generate personalized recommendations/i)).toBeDefined();
  });

  it('renders recommendations when data exists', () => {
    renderRecommendations(mockStateWithData);
    
    // Check for the pillar title
    expect(screen.getByText('Pillar 3: Reduce Emissions via Personalized Insights')).toBeDefined();
    
    // Check for the AI Recommendations section
    expect(screen.getByText('AI Recommendations')).toBeDefined();
  });
});
