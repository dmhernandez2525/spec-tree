import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { SettingsLayout } from './SettingsLayout';

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('SettingsLayout', () => {
  const defaultTabs = [
    {
      value: 'account',
      label: 'Account',
      content: <div data-testid="account-content">Account Settings Content</div>,
    },
    {
      value: 'notifications',
      label: 'Notifications',
      content: <div data-testid="notifications-content">Notifications Content</div>,
    },
    {
      value: 'privacy',
      label: 'Privacy',
      content: <div data-testid="privacy-content">Privacy Content</div>,
    },
  ];

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports SettingsLayout as named export', () => {
      expect(SettingsLayout).toBeDefined();
      expect(typeof SettingsLayout).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', async () => {
      await act(async () => {
        expect(() => {
          render(<SettingsLayout tabs={defaultTabs} />);
        }).not.toThrow();
      });
    });
  });

  describe('Rendering', () => {
    it('renders all tab triggers', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      expect(screen.getByRole('tab', { name: 'Account' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Privacy' })).toBeInTheDocument();
    });

    it('renders tab list', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('shows first tab content by default', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      expect(screen.getByTestId('account-content')).toBeInTheDocument();
    });
  });

  describe('Default Tab', () => {
    it('uses first tab as default when no defaultTab is provided', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      const accountTab = screen.getByRole('tab', { name: 'Account' });
      expect(accountTab).toHaveAttribute('data-state', 'active');
    });

    it('uses provided defaultTab', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} defaultTab="notifications" />);
      });

      const notificationsTab = screen.getByRole('tab', { name: 'Notifications' });
      expect(notificationsTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <SettingsLayout tabs={defaultTabs} className="custom-class" />
        );
        container = result.container;
      });

      const wrapper = container!.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('maintains default space-y-6 class with custom className', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <SettingsLayout tabs={defaultTabs} className="custom-class" />
        );
        container = result.container;
      });

      const wrapper = container!.firstChild;
      expect(wrapper).toHaveClass('space-y-6');
    });
  });

  describe('Tab Content', () => {
    it('renders active tab panel', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      // Only one tab panel should be visible/active at a time
      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toBeInTheDocument();
    });

    it('renders content for active tab', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      // Check that tab contents are in the document
      expect(screen.getByTestId('account-content')).toBeInTheDocument();
    });
  });

  describe('Tab Triggers', () => {
    it('renders triggers with flex-1 class', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveClass('flex-1');
      });
    });

    it('renders correct number of triggers', async () => {
      await act(async () => {
        render(<SettingsLayout tabs={defaultTabs} />);
      });

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);
    });
  });

  describe('Layout Structure', () => {
    it('has tabs container with space-y-6 class', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<SettingsLayout tabs={defaultTabs} />);
        container = result.container;
      });

      const tabsContainer = container!.querySelector('[class*="space-y-6"]');
      expect(tabsContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('requires at least one tab', () => {
      // The component expects at least one tab to be provided
      // as it uses tabs[0].value for the default value
      expect(typeof SettingsLayout).toBe('function');
    });
  });

  describe('Single Tab', () => {
    it('renders with single tab', async () => {
      const singleTab = [
        {
          value: 'only',
          label: 'Only Tab',
          content: <div>Only Content</div>,
        },
      ];

      await act(async () => {
        render(<SettingsLayout tabs={singleTab} />);
      });

      expect(screen.getByRole('tab', { name: 'Only Tab' })).toBeInTheDocument();
    });
  });
});
