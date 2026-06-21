import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const KEY = 'test_key';

  beforeEach(() => {
    window.localStorage.clear();
    // Suppress console.warn for corrupt data tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value from localStorage', () => {
    window.localStorage.setItem(KEY, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    
    act(() => {
      result.current[1]('new_value');
    });
    
    expect(result.current[0]).toBe('new_value');
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('new_value'));
  });

  it('handles functional updater pattern', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify(1));
  });

  it('handles corrupt JSON gracefully and returns initial value', () => {
    window.localStorage.setItem(KEY, 'invalid-json');
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    
    expect(result.current[0]).toBe('initial');
    // It should have cleared the corrupt data
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('handles SSR / localStorage unavailable gracefully on init', () => {
    const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });
    
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    expect(result.current[0]).toBe('initial');
    
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
  });

  it('handles storage availability check throwing an error', () => {
    const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      get: () => { throw new Error('SecurityError'); },
      configurable: true
    });
    
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    expect(result.current[0]).toBe('initial');
    
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
  });

  it('handles localStorage errors when setting', () => {
    const setItemMock = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    
    act(() => {
      result.current[1]('new_value');
    });
    
    expect(result.current[0]).toBe('new_value'); // State still updates
    expect(setItemMock).toHaveBeenCalled();
  });
});
