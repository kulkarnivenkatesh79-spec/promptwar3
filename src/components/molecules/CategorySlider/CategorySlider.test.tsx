import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategorySlider from './CategorySlider';

describe('CategorySlider', () => {
  it('renders correctly', () => {
    const handleChange = vi.fn();
    render(<CategorySlider label="Test" value={50} max={100} onChange={handleChange} />);
    expect(screen.getByText('Test')).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();
  });

  it('handles value change', () => {
    const handleChange = vi.fn();
    render(<CategorySlider label="Test" value={50} max={100} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it('renders with icon and unit', () => {
    const handleChange = vi.fn();
    render(
      <CategorySlider 
        label="Test" 
        value={50} 
        max={100} 
        onChange={handleChange} 
        unit="km" 
        icon={<span data-testid="icon" />} 
      />
    );
    expect(screen.getByTestId('icon')).toBeDefined();
    expect(screen.getAllByText('km')).toBeDefined();
  });

  it('renders with ariaDescription', () => {
    const handleChange = vi.fn();
    render(
      <CategorySlider 
        label="Test" 
        value={50} 
        max={100} 
        onChange={handleChange} 
        ariaDescription="Test desc"
      />
    );
    expect(screen.getByText('Test desc')).toBeDefined();
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-describedby')).toBeDefined();
  });
});
