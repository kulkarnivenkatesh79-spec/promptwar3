import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecommendationList from './RecommendationList';
import { type Recommendation, RecommendationCategory, Difficulty } from '../../../types';

const mockRecs: Recommendation[] = [
  {
    id: '1',
    title: 'Rec 1',
    description: 'Desc 1',
    category: RecommendationCategory.Transport,
    impact: 'high',
    estimatedSavingsTonnes: 1.0,
    difficulty: Difficulty.Easy,
    completed: false
  },
  {
    id: '2',
    title: 'Rec 2',
    description: 'Desc 2',
    category: RecommendationCategory.Diet,
    impact: 'medium',
    estimatedSavingsTonnes: 0.5,
    difficulty: Difficulty.Medium,
    completed: true
  }
];

describe('RecommendationList', () => {
  it('renders correctly and groups by completed status', () => {
    render(<RecommendationList recommendations={mockRecs} />);
    expect(screen.getByText('Rec 1')).toBeDefined();
    expect(screen.getByText('Rec 2')).toBeDefined();
    expect(screen.getByText('Completed Actions')).toBeDefined();
  });

  it('filters by category', () => {
    render(<RecommendationList recommendations={mockRecs} filter={RecommendationCategory.Diet} />);
    expect(screen.queryByText('Rec 1')).toBeNull();
    expect(screen.getByText('Rec 2')).toBeDefined();
  });

  it('calls onFilterChange when filter is selected', () => {
    const onFilterChange = vi.fn();
    render(<RecommendationList recommendations={mockRecs} filter="all" onFilterChange={onFilterChange} />);
    const select = screen.getByLabelText('Filter by category');
    fireEvent.change(select, { target: { value: 'transport' } });
    expect(onFilterChange).toHaveBeenCalledWith('transport');
  });

  it('renders empty state when no recommendations match filter', () => {
    const onFilterChange = vi.fn();
    render(<RecommendationList recommendations={mockRecs} filter={RecommendationCategory.Energy} onFilterChange={onFilterChange} />);
    expect(screen.getByText('No recommendations found')).toBeDefined();
    fireEvent.click(screen.getByText('Clear Filters'));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  it('passes highestCategory prop correctly to ActionCard', () => {
    render(<RecommendationList recommendations={mockRecs} highestCategory={RecommendationCategory.Transport} />);
    // Rec 1 should have High Impact Action badge because its category is transport
    expect(screen.getByText('High Impact Action')).toBeDefined();
  });
});
