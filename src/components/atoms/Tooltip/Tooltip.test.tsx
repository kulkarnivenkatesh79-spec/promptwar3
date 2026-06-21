import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it('renders children correctly', () => {
    render(
      <Tooltip content="Helper text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeDefined();
  });

  it('shows tooltip content on mouse enter and hides on mouse leave', () => {
    render(
      <Tooltip content="Helper text">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Initially hidden
    expect(screen.queryByRole('tooltip')).toBeNull();
    
    // Hover
    const trigger = screen.getByText('Hover me').parentElement!;
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();
    expect(tooltip.textContent).toBe('Helper text');
    expect(tooltip.id).toBe(trigger.getAttribute('aria-describedby'));
    
    // Leave
    fireEvent.mouseLeave(trigger);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip content on focus and hides on blur', () => {
    render(
      <Tooltip content="Helper text">
        <button>Focus me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Focus me').parentElement!;
    
    // Focus
    fireEvent.focus(trigger);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeDefined();
    
    // Blur
    fireEvent.blur(trigger);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('hides tooltip on Escape key press', () => {
    render(
      <Tooltip content="Helper text">
        <button>Press Esc</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Press Esc').parentElement!;
    
    // Focus to show
    fireEvent.focus(trigger);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeDefined();
    
    // Press Escape
    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('handles different positions', () => {
    // Just testing that it renders without crashing for different positions
    const { rerender } = render(
      <Tooltip content="Text" position="top">
        <span>Top</span>
      </Tooltip>
    );
    expect(screen.getByText('Top')).toBeDefined();
    
    rerender(
      <Tooltip content="Text" position="bottom">
        <span>Bottom</span>
      </Tooltip>
    );
    expect(screen.getByText('Bottom')).toBeDefined();

    rerender(
      <Tooltip content="Text" position="left">
        <span>Left</span>
      </Tooltip>
    );
    expect(screen.getByText('Left')).toBeDefined();

    rerender(
      <Tooltip content="Text" position="right">
        <span>Right</span>
      </Tooltip>
    );
    expect(screen.getByText('Right')).toBeDefined();
  });
});
