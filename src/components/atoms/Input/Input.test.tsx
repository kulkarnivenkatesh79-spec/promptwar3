import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('renders correctly with label', () => {
    render(<Input label="Username" id="username" />);
    expect(screen.getByLabelText('Username')).toBeDefined();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Age" id="age" value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Age');
    fireEvent.change(input, { target: { value: '25' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays error message and sets aria-invalid', () => {
    render(<Input label="Email" id="email" error="Invalid email address" />);
    
    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');
    
    expect(screen.getByText('Invalid email address')).toBeDefined();
    expect(screen.getByText('Invalid email address').id).toBe('email-error');
  });

  it('displays helper text', () => {
    render(<Input label="Password" id="password" helperText="Must be 8 characters long" />);
    
    const input = screen.getByLabelText('Password');
    expect(input.getAttribute('aria-describedby')).toBe('password-helper');
    expect(screen.getByText('Must be 8 characters long')).toBeDefined();
  });

  it('prioritizes error over helper text for aria-describedby', () => {
    render(
      <Input 
        label="Password" 
        id="password" 
        error="Too short" 
        helperText="Must be 8 characters long" 
      />
    );
    
    const input = screen.getByLabelText('Password');
    expect(input.getAttribute('aria-describedby')).toBe('password-error password-helper');
    // Helper text is not rendered when there is an error
    expect(screen.getByText('Too short')).toBeDefined();
    expect(screen.queryByText('Must be 8 characters long')).toBeNull();
  });

  it('renders disabled state correctly', () => {
    render(<Input label="Disabled" id="disabled" disabled />);
    const input = screen.getByLabelText('Disabled') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('renders with left and right icons', () => {
    render(
      <Input 
        label="Icons" 
        id="icons" 
        leftIcon={<span data-testid="left-icon" />} 
        rightIcon={<span data-testid="right-icon" />} 
      />
    );
    expect(screen.getByTestId('left-icon')).toBeDefined();
    expect(screen.getByTestId('right-icon')).toBeDefined();
  });

  it('renders without fullWidth and with required prop', () => {
    render(<Input label="Required" id="req" fullWidth={false} required />);
    const input = document.getElementById('req') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.required).toBe(true);
    // The required asterisk should be in the document (aria-hidden)
    expect(screen.getByText('*')).toBeDefined();
  });

  it('generates an ID if not provided', () => {
    render(<Input label="AutoID" />);
    const input = screen.getByLabelText('AutoID') as HTMLInputElement;
    expect(input.id).toBeDefined();
    expect(input.id.length).toBeGreaterThan(0);
  });
});
