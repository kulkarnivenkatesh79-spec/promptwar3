export function formatCO2(kg: number): string {
  if (typeof kg !== 'number' || isNaN(kg)) return '0 kg';
  if (Math.abs(kg) >= 1000) {
    const tonnes = kg / 1000;
    return `${tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })} tonnes`;
  }
  return `${Math.round(kg).toLocaleString()} kg`;
}
export function formatPercentage(value: number, decimals: number = 1): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}
export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
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
