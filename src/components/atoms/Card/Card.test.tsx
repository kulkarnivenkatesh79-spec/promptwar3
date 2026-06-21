import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card', () => {
  it('renders default state', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeDefined();
  });

  it('renders with glass prop', () => {
    render(<Card glass data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('glass');
  });

  it('renders with fullHeight prop', () => {
    render(<Card fullHeight data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('fullHeight');
  });

  it('renders with hoverable prop', () => {
    render(<Card hoverable data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('hoverable');
  });

  it('renders with specific padding', () => {
    render(<Card padding="lg" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('padding-lg');
  });
});
