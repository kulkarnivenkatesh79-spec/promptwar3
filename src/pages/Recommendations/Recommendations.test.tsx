import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Recommendations from './Recommendations';
import { CarbonProvider } from '../../context/CarbonContext';
import { CarbonState, RecommendationCategory } from '../../types';

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
    recommendations: [],
    entries: [
      {
        id: '1',
        date: '2026-06-01',
        totalEmissions: 1000,
        ecoGrade: 'A' as any,
        transportEmissions: 300,
        dietEmissions: 400,
        energyEmissions: 300,
        recommendations: [
          {
            id: 'r1',
            title: 'Plant-based diet',
            description: 'Eat more plants',
            category: RecommendationCategory.Diet,
            potentialSavings: 200,
            difficulty: 'Medium',
            timeToImplement: 'Ongoing',
            completed: false,
          }
        ],
      }
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
