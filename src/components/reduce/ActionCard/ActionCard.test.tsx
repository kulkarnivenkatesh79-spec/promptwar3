import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionCard from './ActionCard';
import { type Recommendation, RecommendationCategory, Difficulty } from '../../../types';

const mockRec: Recommendation = {
  id: '1',
  title: 'Test Action',
  description: 'Test Description',
  category: RecommendationCategory.Transport,
  estimatedSavingsTonnes: 2.0,
  difficulty: Difficulty.Easy,
  completed: false,
  icon: 'Zap',
  priorityScore: 100
};

describe('ActionCard', () => {
  it('renders correctly', () => {
    render(<ActionCard recommendation={mockRec} />);
    expect(screen.getByText('Test Action')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
    expect(screen.getByText('Save 2 tonnes CO₂/yr')).toBeDefined();
  });

  it('handles completion', () => {
    const onComplete = vi.fn();
    render(<ActionCard recommendation={mockRec} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Mark as Done'));
    expect(onComplete).toHaveBeenCalledWith('1');
  });

  it('handles action', () => {
    const onAction = vi.fn();
    render(<ActionCard recommendation={mockRec} onAction={onAction} />);
    fireEvent.click(screen.getByText('Set as Goal'));
    expect(onAction).toHaveBeenCalledWith('1');
  });

  it('shows high impact badge', () => {
    render(<ActionCard recommendation={mockRec} isHighImpact={true} />);
    expect(screen.getByText('High Impact Action')).toBeDefined();
  });

  it('renders completed state', () => {
    render(<ActionCard recommendation={{ ...mockRec, completed: true }} />);
    expect(screen.getByText('Done')).toBeDefined();
    expect(screen.queryByText('Mark as Done')).toBeNull();
  });

  it('renders without an icon', () => {
    const recWithoutIcon = { ...mockRec, icon: undefined };
    // @ts-expect-error - Intentionally testing missing icon
    render(<ActionCard recommendation={recWithoutIcon} />);
    // Should fallback to Lightbulb icon and not crash
    expect(screen.getByText('Test Action')).toBeDefined();
  });
});
