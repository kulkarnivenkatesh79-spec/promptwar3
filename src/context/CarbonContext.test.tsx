/**
 * @fileoverview Component tests for the CarbonContext provider.
 * Tests state management, persistence, and sample data generation.
 * @module context/CarbonContext.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CarbonProvider, useCarbonContext, generateSampleData } from './CarbonContext';
import { CarbonActionType, DietType, EnergySource, TransportMode } from '../types';
import type { CarbonEntry, Goal } from '../types';
import React from 'react';

/* ============================================================
 * generateSampleData
 * ============================================================ */

describe('generateSampleData', () => {
  it('returns a valid CarbonState with all required fields', () => {
    const state = generateSampleData();
    expect(state.profile).toBeDefined();
    expect(state.entries).toBeInstanceOf(Array);
    expect(state.goals).toBeInstanceOf(Array);
    expect(state.recommendations).toBeInstanceOf(Array);
    expect(state.activityLog).toBeInstanceOf(Array);
    expect(typeof state.isLoading).toBe('boolean');
  });

  it('contains 6 months of entries', () => {
    const state = generateSampleData();
    expect(state.entries.length).toBe(6);
  });

  it('shows a decreasing emissions trend', () => {
    const state = generateSampleData();
    const totals = state.entries.map(e => e.totalEmissions);
    // First entry should have highest emissions, last should have lowest
    expect(totals[0]).toBeGreaterThan(totals[totals.length - 1]!);
  });

  it('contains at least 2 goals', () => {
    const state = generateSampleData();
    expect(state.goals.length).toBeGreaterThanOrEqual(2);
  });

  it('contains recommendations', () => {
    const state = generateSampleData();
    expect(state.recommendations.length).toBeGreaterThan(0);
  });

  it('contains activity log entries', () => {
    const state = generateSampleData();
    expect(state.activityLog.length).toBeGreaterThan(0);
  });

  it('has a valid user profile', () => {
    const state = generateSampleData();
    expect(state.profile.name).toBeTruthy();
    expect(['us', 'eu', 'global']).toContain(state.profile.region);
    expect(state.profile.onboarded).toBe(true);
  });
});

/* ============================================================
 * CarbonProvider + useCarbonContext
 * ============================================================ */

describe('CarbonProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(CarbonProvider, null, children);

  it('provides state and dispatch', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });
    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
  });

  it('initializes with sample data when no persisted state exists', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });
    expect(result.current.state.entries.length).toBeGreaterThan(0);
    expect(result.current.state.profile.name).toBeTruthy();
  });

  it('initializes with sample data when localStorage contains invalid structure', () => {
    localStorage.setItem('carbon_footprint_data', JSON.stringify({ invalid: 'structure' }));
    const { result } = renderHook(() => useCarbonContext(), { wrapper });
    expect(result.current.state.entries.length).toBeGreaterThan(0);
    // The state will be immediately persisted back to localStorage
    expect(localStorage.getItem('carbon_footprint_data')).not.toBeNull();
  });

  it('initializes with sample data when localStorage contains unparseable JSON', () => {
    localStorage.setItem('carbon_footprint_data', '{ unparseable: json');
    const { result } = renderHook(() => useCarbonContext(), { wrapper });
    expect(result.current.state.entries.length).toBeGreaterThan(0);
    expect(localStorage.getItem('carbon_footprint_data')).not.toBeNull();
  });

  it('does not crash when persisting state fails', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    
    const { result } = renderHook(() => useCarbonContext(), { wrapper });
    
    act(() => {
      result.current.dispatch({ type: CarbonActionType.SetLoading, payload: true });
    });
    
    expect(result.current.state.isLoading).toBe(true);
    
    localStorage.setItem = originalSetItem;
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useCarbonContext());
    }).toThrow('useCarbonContext must be used within a <CarbonProvider>');
  });

  it('dispatches ADD_GOAL correctly', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });

    const newGoal: Goal = {
      id: 'test_goal',
      description: 'Reduce by 20%',
      targetTonnes: 5.0,
      startDate: '2026-01-01',
      targetDate: '2026-12-31',
      achieved: false,
    };

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.AddGoal,
        payload: newGoal,
      });
    });

    const found = result.current.state.goals.find(g => g.id === 'test_goal');
    expect(found).toBeDefined();
    expect(found!.description).toBe('Reduce by 20%');
  });

  it('dispatches TOGGLE_RECOMMENDATION correctly', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });

    const recId = result.current.state.recommendations[0]?.id;
    if (!recId) return; // Guard for empty recommendations

    const initialCompleted = result.current.state.recommendations[0]!.completed;

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.ToggleRecommendation,
        payload: recId,
      });
    });

    const updated = result.current.state.recommendations.find(r => r.id === recId);
    expect(updated!.completed).toBe(!initialCompleted);
  });

  it('dispatches ADD_ENTRY correctly', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });

    const initialCount = result.current.state.entries.length;

    const newEntry: CarbonEntry = {
      id: 'test_entry',
      date: '2026-06-13',
      transportEmissions: 100,
      dietEmissions: 200,
      energyEmissions: 300,
      totalEmissions: 600,
      transportEntries: [
        { id: 'te_1', mode: TransportMode.Bus, distanceKm: 10, frequencyPerWeek: 5 },
      ],
      dietConfig: { dietType: DietType.Average, mealsPerDay: 3, foodWastePercent: 10 },
      energyUsage: {
        electricityKwh: 500,
        electricitySource: EnergySource.ElectricityUS,
        naturalGasTherms: 20,
        heatingOilGallons: 0,
      },
    };

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.AddEntry,
        payload: newEntry,
      });
    });

    expect(result.current.state.entries.length).toBe(initialCount + 1);
    expect(result.current.state.currentEntry).toBeNull();
  });

  it('dispatches REMOVE_GOAL correctly', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });

    const goalId = result.current.state.goals[0]?.id;
    if (!goalId) return;

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.RemoveGoal,
        payload: goalId,
      });
    });

    const removed = result.current.state.goals.find(g => g.id === goalId);
    expect(removed).toBeUndefined();
  });

  it('dispatches SET_LOADING correctly', () => {
    const { result } = renderHook(() => useCarbonContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.SetLoading,
        payload: true,
      });
    });

    expect(result.current.state.isLoading).toBe(true);

    act(() => {
      result.current.dispatch({
        type: CarbonActionType.SetLoading,
        payload: false,
      });
    });

    expect(result.current.state.isLoading).toBe(false);
  });
});
