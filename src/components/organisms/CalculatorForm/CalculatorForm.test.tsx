import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalculatorForm from './CalculatorForm';
import { CarbonProvider } from '../../../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

describe('CalculatorForm', () => {

  it('renders, progresses through steps, and handles async submission', async () => {
    vi.useFakeTimers();
    render(
      <BrowserRouter>
        <CarbonProvider>
          <CalculatorForm />
        </CarbonProvider>
      </BrowserRouter>
    );

    // Step 1: Transport
    expect(screen.getByLabelText('Primary Transport Mode')).toBeDefined();
    fireEvent.click(screen.getByText('Continue'));

    // Step 2: Diet
    expect(screen.getByLabelText('Primary Diet Type')).toBeDefined();
    fireEvent.click(screen.getByText('Continue'));

    // Step 3: Energy
    expect(screen.getByLabelText('Monthly Electricity')).toBeDefined();
    
    // Previous step check
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByLabelText('Primary Diet Type')).toBeDefined();
    fireEvent.click(screen.getByText('Continue'));

    // Submit
    const submitBtn = screen.getByText('Save Results');
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Fast-forward timeout
    await act(async () => {
      vi.runAllTimers();
    });

    vi.useRealTimers();
  });
});

  it('handles rapid multi-clicks safely', async () => {
    render(
      <BrowserRouter>
        <CarbonProvider>
          <CalculatorForm />
        </CarbonProvider>
      </BrowserRouter>
    );

    const continueBtn = screen.getByText('Continue');
    // Rapid clicks
    fireEvent.click(continueBtn);
    fireEvent.click(continueBtn);
    fireEvent.click(continueBtn);
    fireEvent.click(continueBtn);

    // Should progress to the end and not crash
    expect(screen.getByText('Save Results')).toBeDefined();
  });
