import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let addEventListenerMock: any;
  let removeEventListenerMock: any;
  
  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });

  it('adds and removes event listener', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates state when media query change event fires', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    
    expect(result.current).toBe(false);
    
    // Simulate event
    const callback = addEventListenerMock.mock.calls[0][1];
    act(() => {
      callback({ matches: true } as MediaQueryListEvent);
    });
    
    expect(result.current).toBe(true);
  });
});
