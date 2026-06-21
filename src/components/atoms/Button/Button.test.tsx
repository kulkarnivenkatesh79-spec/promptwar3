import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDefined();
    // Default class is not empty
    expect(button.className).toContain('primary');
  });

  it('renders with fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: 'Full Width' });
    expect(button.className).toContain('fullWidth');
  });

  it('handles click correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click when isLoading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} isLoading>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with left and right icons', () => {
    render(
      <Button 
        leftIcon={<span data-testid="left" />} 
        rightIcon={<span data-testid="right" />}
      >
        Icons
      </Button>
    );
    expect(screen.getByTestId('left')).toBeDefined();
    expect(screen.getByTestId('right')).toBeDefined();
  });
});
