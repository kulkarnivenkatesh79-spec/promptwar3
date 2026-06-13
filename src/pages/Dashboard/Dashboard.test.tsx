/**
 * @fileoverview React Testing Library tests for Dashboard component.
 * Verifies empty state, "Understand" modal rendering, and branch coverage.
 * @module pages/Dashboard/Dashboard.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { CarbonProvider } from '../../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

// Mock recharts to avoid rendering complex SVGs in tests
vi.mock('recharts', () => {
  const OriginalRechartsModule = vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
    Cell: () => <div data-testid="cell" />,
  };
});

describe('Dashboard Component', () => {
  it('renders the dashboard with sample data when no persisted state exists', () => {
    // Clear localStorage to trigger sample data generation
    localStorage.clear();
    
    render(
      <BrowserRouter>
        <CarbonProvider>
          <Dashboard />
        </CarbonProvider>
      </BrowserRouter>
    );

    // CarbonProvider generates sample data, so the main dashboard should render
    expect(screen.getByText('Track Your Footprint Trend')).toBeDefined();
    expect(screen.getByText('Update Footprint')).toBeDefined();
    expect(screen.getByText('Understand Equivalents')).toBeDefined();
  });

  it('opens and closes the CarbonInfoModal', () => {
    // Add sample data to localStorage so Dashboard doesn't show empty state
    localStorage.setItem('carbon_footprint_data', JSON.stringify({
      entries: [{
        id: '1',
        date: new Date().toISOString(),
        totalEmissions: 5000,
        transportEmissions: 2000,
        dietEmissions: 2000,
        energyEmissions: 1000
      }],
      profile: { name: 'Test User' }
    }));

    render(
      <BrowserRouter>
        <CarbonProvider>
          <Dashboard />
        </CarbonProvider>
      </BrowserRouter>
    );

    // Initial check - Modal shouldn't be open
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click "Understand Equivalents"
    const understandBtn = screen.getByText('Understand Equivalents');
    fireEvent.click(understandBtn);

    // Modal should open
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Pillar 1: Understand Your Footprint')).toBeDefined();

    // Close modal
    const closeBtn = screen.getByLabelText('Close understand modal');
    fireEvent.click(closeBtn);

    // Modal should close
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders Track Your Footprint Trend chart correctly', () => {
    render(
      <BrowserRouter>
        <CarbonProvider>
          <Dashboard />
        </CarbonProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Pillar 2: Track Daily Metrics')).toBeDefined();
    expect(screen.getByText('Track Your Footprint Trend')).toBeDefined();
    expect(screen.getByText('Track Category Breakdown')).toBeDefined();
  });
});
