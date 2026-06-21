import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Calculator from './Calculator';
import { CarbonProvider } from '../../context/CarbonContext';

describe('Calculator Page', () => {
  const renderCalculator = () => {
    return render(
      <BrowserRouter>
        <CarbonProvider>
          <Calculator />
        </CarbonProvider>
      </BrowserRouter>
    );
  };

  it('renders the calculator page', () => {
    renderCalculator();
    
    // Check for main heading
    expect(screen.getByRole('heading', { level: 1, name: /Footprint Calculator/i })).toBeDefined();
    
    // Check for the description text
    expect(screen.getByText(/estimate your carbon footprint/i)).toBeDefined();
    
    // Check if the form is rendered
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
