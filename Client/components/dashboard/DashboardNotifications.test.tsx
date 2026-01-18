import { it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardNotifications } from './DashboardNotifications';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  global.ResizeObserver = ResizeObserverMock as any;
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

export const dashboardNotificationsTests = () => {
  it('exports DashboardNotifications component', () => {
    expect(DashboardNotifications).toBeDefined();
  });

  it('renders notification preferences heading', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });
  });

  it('renders email reminders setting', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Email Reminders')).toBeInTheDocument();
    });
  });

  it('renders SMS reminders setting', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByText('SMS Reminders')).toBeInTheDocument();
    });
  });

  it('renders marketing emails setting', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Marketing Emails')).toBeInTheDocument();
    });
  });

  it('renders newsletter setting', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Newsletter')).toBeInTheDocument();
    });
  });

  it('renders save preferences button', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save preferences' })).toBeInTheDocument();
    });
  });

  it('renders description text', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      expect(
        screen.getByText('Manage how you want to be notified about various activities.')
      ).toBeInTheDocument();
    });
  });

  it('renders four notification switches', async () => {
    render(<DashboardNotifications />);

    await waitFor(() => {
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBe(4);
    });
  });

  it('renders form element', async () => {
    const { container } = render(<DashboardNotifications />);

    await waitFor(() => {
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
};

dashboardNotificationsTests();
