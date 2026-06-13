/**
 * @fileoverview Formatting utilities for the Carbon Footprint Awareness Platform.
 * All functions are pure, type-safe, and handle edge cases gracefully.
 * @module utils/formatters
 */

/**
 * Formats a carbon footprint value in kg CO2 to a readable string.
 * Uses tonnes for values >= 1000.
 * 
 * @param kg - The amount in kilograms
 * @returns Formatted string (e.g., '1,234 kg' or '1.23 tonnes')
 */
export function formatCO2(kg: number): string {
  if (typeof kg !== 'number' || isNaN(kg)) return '0 kg';
  
  if (Math.abs(kg) >= 1000) {
    const tonnes = kg / 1000;
    return `${tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })} tonnes`;
  }
  
  return `${Math.round(kg).toLocaleString()} kg`;
}

/**
 * Formats a decimal value as a percentage.
 * 
 * @param value - The value to format (e.g., 45.2)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., '45.2%')
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with locale-aware thousands separators.
 * 
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats an ISO date string to a readable format (e.g., "Jan 1, 2026").
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats an ISO date string to a month/year format (e.g., "Jan 2026").
 * 
 * @param dateString - ISO date string
 * @returns Formatted month string
 */
export function formatMonth(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Calculates and formats a trend between two values.
 * 
 * @param current - The current value
 * @param previous - The previous value
 * @returns Object with formatted percentage and direction
 */
export function formatTrend(current: number, previous: number): { value: string; direction: 'up' | 'down' | 'flat' } {
  if (typeof current !== 'number' || typeof previous !== 'number' || isNaN(current) || isNaN(previous) || previous === 0) {
    return { value: '0%', direction: 'flat' };
  }
  
  const difference = current - previous;
  const percentage = (Math.abs(difference) / previous) * 100;
  
  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (difference > 0) direction = 'up';
  else if (difference < 0) direction = 'down';
  
  return {
    value: `${formatPercentage(percentage, 1)}`,
    direction,
  };
}

/**
 * Returns a relative time string (e.g., "2 days ago", "just now").
 * 
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return formatDate(dateString);
  } catch {
    return '';
  }
}
