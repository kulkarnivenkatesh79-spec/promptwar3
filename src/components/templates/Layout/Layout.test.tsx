import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { ThemeProvider } from '../../../context/ThemeContext';
import { CarbonProvider } from '../../../context/CarbonContext';

describe('Layout', () => {
  beforeEach(() => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <CarbonProvider>
            <Layout>
              <div data-testid="layout-child">Content</div>
            </Layout>
          </CarbonProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renders children inside layout', () => {
    renderLayout();
    expect(screen.getByTestId('layout-child')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('renders navbar', () => {
    renderLayout();
    expect(screen.getByRole('banner')).toBeDefined(); // Navbar is usually a banner or nav
    expect(screen.getByText('EcoTrack')).toBeDefined(); // Logo text
  });

  it('renders skip link for accessibility', () => {
    renderLayout();
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('renders main content area with correct id', () => {
    renderLayout();
    const main = screen.getByRole('main');
    expect(main.id).toBe('main-content');
  });
});
