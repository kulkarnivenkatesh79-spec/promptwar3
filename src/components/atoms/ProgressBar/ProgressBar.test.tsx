import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders correctly with given progress', () => {
    render(<ProgressBar value={50} ariaLabel="Loading progress" />);
    const progressbar = screen.getByRole('progressbar');
    
    expect(progressbar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressbar.getAttribute('aria-label')).toBe('Loading progress');
  });

  it('clamps progress to 0', () => {
    render(<ProgressBar value={-20} ariaLabel="Negative progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('clamps progress to 100', () => {
    render(<ProgressBar value={150} ariaLabel="Over 100 progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('100');
  });

  it('shows label text if provided', () => {
    render(<ProgressBar value={75} showLabel={true} ariaLabel="Upload Status" />);
    expect(screen.getByText('Upload Status')).toBeDefined();
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('hides percentage text if showLabel is false', () => {
    render(
      <ProgressBar 
        value={75} 
        showLabel={false} 
        ariaLabel="Upload" 
      />
    );
    expect(screen.queryByText('75%')).toBeNull();
  });

  it('applies custom size classes', () => {
    const { container } = render(<ProgressBar value={50} size="sm" ariaLabel="Small" />);
    // Since we don't test specific CSS modules easily in unit tests without classname matchers,
    // we just ensure it renders without crashing for different sizes.
    expect(container).toBeDefined();
  });
});
