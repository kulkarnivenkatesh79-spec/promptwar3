import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CalculatorForm from './CalculatorForm';
import { CarbonProvider } from '../../../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

describe('CalculatorForm', () => {

  it('renders and progresses through steps', async () => {
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
    fireEvent.click(submitBtn);

  });
});
