import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import React from 'react';

describe('ThemeContext', () => {
  let matchMediaMock: Mock;
  let addEventListenerMock: Mock;
  let removeEventListenerMock: Mock;

  beforeEach(() => {
    localStorage.clear();

    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(ThemeProvider, null, children);

  it('provides theme state', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBeDefined();
    expect(result.current.preference).toBeDefined();
    expect(result.current.toggleTheme).toBeDefined();
    expect(result.current.setTheme).toBeDefined();
  });

  it('updates when system preference changes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      // Simulate system dark mode enabled
      const callback = addEventListenerMock.mock.calls[0]?.[1] as ((e: any) => void) | undefined;
      if (callback) callback({ matches: true });
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('explicitly sets theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.preference).toBe('dark');
    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme_preference')).toBe('dark');
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a <ThemeProvider>');
  });
});
