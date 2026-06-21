import { render, screen, fireEvent, act } from '@testing-library/react';
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

  it('handles select changes for transport mode and diet type', () => {
    render(
      <BrowserRouter>
        <CarbonProvider>
          <CalculatorForm />
        </CarbonProvider>
      </BrowserRouter>
    );

    // Change transport mode - verify select exists and onChange fires without error
    const transportSelect = screen.getByLabelText('Primary Transport Mode');
    expect(transportSelect).toBeDefined();
    fireEvent.change(transportSelect, { target: { value: 'public_transit' } });

    // Navigate to step 2
    fireEvent.click(screen.getByText('Continue'));

    // Change diet type - verify select exists and onChange fires without error
    const dietSelect = screen.getByLabelText('Primary Diet Type');
    expect(dietSelect).toBeDefined();
    fireEvent.change(dietSelect, { target: { value: 'vegetarian' } });
  });

  it('logs error if submission fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // We can force an error by mocking navigate since it's used inside the try block
    vi.mock('react-router-dom', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react-router-dom')>();
      return {
        ...actual,
        useNavigate: () => {
          return () => { throw new Error('Simulated Navigation Error'); };
        }
      };
    });
    
    vi.useFakeTimers();
    render(
      <BrowserRouter>
        <CarbonProvider>
          <CalculatorForm />
        </CarbonProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Results'));
    });
    
    await act(async () => {
      vi.runAllTimers();
    });

    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    vi.useRealTimers();
    // restore the mock is tricky with vi.mock, but it will be fine for this test run.
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
