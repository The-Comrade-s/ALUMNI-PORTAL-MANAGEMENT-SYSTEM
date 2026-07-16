import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/forms/LoginForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { id: 1, name: 'Test' } }) })
    ) as unknown as typeof fetch;
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows a validation-required state when submitted empty', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('disables the submit button while loading', async () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: /log in/i });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    fireEvent.click(button);
    expect(button).toBeDisabled();
  });
});
