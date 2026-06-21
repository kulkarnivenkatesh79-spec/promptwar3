import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GoalCard from './GoalCard';
import { RecommendationCategory } from '../../../types';

describe('GoalCard', () => {
  const mockGoal = {
    id: 'g1',
    description: 'Switch to a vegetarian diet twice a week.',
    targetTonnes: 0.5,
    startDate: '2026-01-01',
    targetDate: '2026-12-31',
    achieved: false,
  };

  it('renders goal information correctly', () => {
    render(<GoalCard goal={mockGoal} currentEmissionsKg={750} />);
    
    expect(screen.getByText('Switch to a vegetarian diet twice a week.')).toBeDefined();
    // current: 750, target: 500
    // baseline = 1000 (target * 2), startingExcess = 500
    // excess = 250
    // progress = 100 - (250/500 * 100) = 50%
  });

  it('calculates and passes correct progress to ProgressBar', () => {
    render(<GoalCard goal={mockGoal} currentEmissionsKg={750} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('50'); // 50%
  });

  it('shows completion badge when completed', () => {
    render(<GoalCard goal={{ ...mockGoal, achieved: true }} currentEmissionsKg={400} />);
    expect(screen.getByText('Achieved')).toBeDefined();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<GoalCard goal={mockGoal} currentEmissionsKg={750} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith(mockGoal.id);
  });
});
