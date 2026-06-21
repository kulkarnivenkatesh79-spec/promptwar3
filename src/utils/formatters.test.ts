/**
 * @fileoverview Unit tests for formatting utilities.
 * Tests edge cases, NaN handling, and locale formatting.
 * @module utils/formatters.test
 */

import { describe, it, expect } from 'vitest';
import {
  formatCO2,
  formatPercentage,
  formatNumber,
  formatDate,
  formatMonth,
  formatTrend,
  getRelativeTime,
} from './formatters';

/* ============================================================
 * formatCO2
 * ============================================================ */

describe('formatCO2', () => {
  it('formats values below 1000 as kg', () => {
    const result = formatCO2(500);
    expect(result).toContain('kg');
    expect(result).toContain('500');
  });

  it('formats values >= 1000 as tonnes', () => {
    const result = formatCO2(1500);
    expect(result).toContain('tonnes');
    expect(result).toContain('1.5');
  });

  it('handles 0', () => {
    expect(formatCO2(0)).toContain('0');
    expect(formatCO2(0)).toContain('kg');
  });

  it('handles NaN', () => {
    expect(formatCO2(NaN)).toBe('0 kg');
  });

  it('handles negative values', () => {
    const result = formatCO2(-1500);
    expect(result).toContain('tonnes');
  });

  it('handles exact 1000', () => {
    const result = formatCO2(1000);
    expect(result).toContain('tonnes');
  });
});

/* ============================================================
 * formatPercentage
 * ============================================================ */

describe('formatPercentage', () => {
  it('formats with default 1 decimal', () => {
    expect(formatPercentage(45.23)).toBe('45.2%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercentage(45.2345, 2)).toBe('45.23%');
  });

  it('handles 0', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('handles NaN', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });

  it('handles 100%', () => {
    expect(formatPercentage(100)).toBe('100.0%');
  });
});

/* ============================================================
 * formatNumber
 * ============================================================ */

describe('formatNumber', () => {
  it('formats integers correctly', () => {
    const result = formatNumber(1234);
    // Locale-dependent, but should contain the digits
    expect(result).toMatch(/1.*234/);
  });

  it('formats with decimals', () => {
    const result = formatNumber(1234.5, 2);
    // Locale-aware: may include commas/periods as group separators
    expect(result).toMatch(/1.*234/);
    expect(result).toContain('50');
  });

  it('handles 0', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('0');
  });
});

/* ============================================================
 * formatDate
 * ============================================================ */

describe('formatDate', () => {
  it('formats valid ISO date', () => {
    const result = formatDate('2026-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('2026');
    expect(result).toContain('15');
  });

  it('handles invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('handles empty string', () => {
    expect(formatDate('')).toBe('Invalid Date');
  });

  it('handles formatting errors gracefully', () => {
    const originalFormat = Intl.DateTimeFormat;
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      format: () => { throw new Error('Format failed'); }
    }));
    expect(formatDate('2026-01-15')).toBe('Invalid Date');
    Intl.DateTimeFormat = originalFormat;
  });
});

/* ============================================================
 * formatMonth
 * ============================================================ */

describe('formatMonth', () => {
  it('formats valid date to month/year', () => {
    const result = formatMonth('2026-06-15');
    expect(result).toContain('Jun');
    expect(result).toContain('2026');
  });

  it('handles invalid date string', () => {
    expect(formatMonth('invalid')).toBe('Invalid Date');
  });

  it('handles formatting errors gracefully', () => {
    const originalFormat = Intl.DateTimeFormat;
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      format: () => { throw new Error('Format failed'); }
    }));
    expect(formatMonth('2026-06-15')).toBe('Invalid Date');
    Intl.DateTimeFormat = originalFormat;
  });
});

/* ============================================================
 * formatTrend
 * ============================================================ */

describe('formatTrend', () => {
  it('detects upward trend', () => {
    const { direction } = formatTrend(150, 100);
    expect(direction).toBe('up');
  });

  it('detects downward trend', () => {
    const { direction } = formatTrend(80, 100);
    expect(direction).toBe('down');
  });

  it('detects flat trend for equal values', () => {
    const { direction } = formatTrend(100, 100);
    expect(direction).toBe('flat');
  });

  it('returns 0% for zero previous', () => {
    const { value, direction } = formatTrend(100, 0);
    expect(value).toBe('0%');
    expect(direction).toBe('flat');
  });

  it('calculates correct percentage', () => {
    const { value } = formatTrend(150, 100);
    expect(value).toContain('50');
  });

  it('handles NaN inputs', () => {
    const { direction } = formatTrend(NaN, 100);
    expect(direction).toBe('flat');
  });
});

/* ============================================================
 * getRelativeTime
 * ============================================================ */

describe('getRelativeTime', () => {
  it('returns "just now" for very recent timestamps', () => {
    const now = new Date().toISOString();
    expect(getRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago for timestamps within the hour', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const result = getRelativeTime(tenMinAgo);
    expect(result).toContain('min');
    expect(result).toContain('ago');
  });

  it('returns hours ago for timestamps within the day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(threeHoursAgo);
    expect(result).toContain('hour');
    expect(result).toContain('ago');
  });

  it('returns "yesterday" for 1 day ago', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(oneDayAgo)).toBe('yesterday');
  });

  it('returns days ago for timestamps within the month', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(fiveDaysAgo);
    expect(result).toContain('days ago');
  });

  it('returns empty string for invalid date', () => {
    expect(getRelativeTime('not-a-date')).toBe('');
  });

  it('returns full date string for dates older than 30 days', () => {
    const olderThanMonth = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(olderThanMonth);
    // Should fallback to formatDate which returns Month Day, Year
    expect(result).not.toBe('');
    expect(result).not.toContain('ago');
  });

  it('handles formatting errors gracefully', () => {
    // We can simulate an error by making getTime throw
    const originalGetTime = Date.prototype.getTime;
    Date.prototype.getTime = () => { throw new Error('Simulated error'); };
    expect(getRelativeTime('2026-01-15')).toBe('');
    Date.prototype.getTime = originalGetTime;
  });
});
