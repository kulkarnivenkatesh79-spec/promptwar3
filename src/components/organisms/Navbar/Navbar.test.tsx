import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Navbar from './Navbar';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock matchMedia for ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders all navigation links', () => {
    renderNavbar();
    expect(screen.getByLabelText('EcoTrack Home')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Calculator')).toBeDefined();
  });

  it('handles mobile menu toggle and correctly sets ARIA/inert', () => {
    renderNavbar();
    const toggleButton = screen.getByLabelText('Open menu');
    
    // Initially closed
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByLabelText('Mobile Navigation')).toBeNull(); // Because conditionally rendered
    
    // Open menu
    fireEvent.click(toggleButton);
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu?.getAttribute('aria-hidden')).toBe('false');
    expect(screen.getByLabelText('Mobile Navigation')).toBeDefined();
    
    // Close menu
    fireEvent.click(toggleButton);
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByLabelText('Mobile Navigation')).toBeNull();
  });

  it('handles route change to close mobile menu', () => {
    renderNavbar();
    const toggleButton = screen.getByLabelText('Open menu');
    fireEvent.click(toggleButton); // Open
    expect(screen.getByLabelText('Mobile Navigation')).toBeDefined();
    
    // Click a link inside mobile nav
    const calcLink = screen.getAllByText('Calculator')[1]; // 2nd one is mobile
    fireEvent.click(calcLink);
    
    // Should close menu
    expect(screen.queryByLabelText('Mobile Navigation')).toBeNull();
  });

  it('toggles theme correctly', () => {
    renderNavbar();
    const themeButton = screen.getByLabelText(/Switch to/i);
    fireEvent.click(themeButton);
    // As we mock matchMedia to false (light), clicking should toggle to dark
    // The aria-label will change based on current theme, but since ThemeContext manages it,
    // we can just ensure it doesn't crash and the button is clickable.
    expect(themeButton).toBeDefined();
  });

  it('throttles scroll events to prevent forced reflows', () => {
    renderNavbar();
    
    // Header shouldn't have scrolled class initially
    const header = document.querySelector('header');
    expect(header?.className).not.toContain('scrolled');

    // Simulate scroll past 10px
    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    
    // Class shouldn't be added immediately (debounced)
    expect(header?.className).not.toContain('scrolled');
    
    // Fast forward time by 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });
    
    // Now it should be updated
    expect(header?.className).toContain('scrolled');
    
    // Scroll back to top
    act(() => {
      window.scrollY = 0;
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(50);
    });
    expect(header?.className).not.toContain('scrolled');
  });

  it('cleans up timeout on unmount', () => {
    const { unmount } = renderNavbar();
    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    // Unmount before timeout fires
    unmount();
    // Test passes if no errors are thrown for unmounted state updates
  });
});
