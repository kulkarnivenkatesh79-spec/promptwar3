import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Progress from './Progress';
import { CarbonProvider } from '../../context/CarbonContext';
import { CarbonState, EcoGrade } from '../../types';

// Mock Recharts to avoid DOM/SVG issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart"></div>,
  BarChart: () => <div data-testid="bar-chart"></div>,
  Bar: () => <div />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe('Progress Page', () => {
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
        ecoGrade: EcoGrade.A,
        transportEmissions: 300,
        dietEmissions: 400,
        energyEmissions: 300,
        recommendations: [],
      }
    ],
    goals: [
      {
        id: 'g1',
        title: 'Goal 1',
        description: 'Desc',
        category: 'transport' as any,
        targetDate: '2026-12-31',
        targetReduction: 500,
        currentProgress: 100,
        completed: false,
        createdAt: '2026-01-01',
      }
    ],
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

  const renderProgress = (state: CarbonState) => {
    window.localStorage.setItem('carbon_footprint_data', JSON.stringify(state));
    return render(
      <BrowserRouter>
        <CarbonProvider>
          <Progress />
        </CarbonProvider>
      </BrowserRouter>
    );
  };

  it('renders empty state when no data exists', () => {
    renderProgress(mockStateEmpty);
    expect(screen.getByText('Calculate your footprint multiple times to see historical trends.')).toBeDefined();
    expect(screen.getByText('No recent activity recorded.')).toBeDefined();
    expect(screen.getByText('No active goals')).toBeDefined();
  });

  it('renders charts and goals when data exists', () => {
    renderProgress(mockStateWithData);
    
    // Check main titles
    expect(screen.getByText('Progress & Goals')).toBeDefined();
    
    // Check if charts are rendered
    expect(screen.getByTestId('bar-chart')).toBeDefined();
    
    // Check if goals are rendered
    expect(screen.getByText('Active Goals')).toBeDefined();
    expect(screen.getByText('Desc')).toBeDefined();
  });
});
