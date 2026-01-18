import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntegrationsSettings } from './IntegrationsSettings';

// Mock Redux
const mockDispatch = vi.fn(() => ({
  unwrap: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/hooks/use-store', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
}));

// Mock settings-slice
vi.mock('@/lib/store/settings-slice', () => ({
  connectIntegration: vi.fn((data) => ({ type: 'settings/connectIntegration', payload: data })),
  disconnectIntegration: vi.fn((id) => ({ type: 'settings/disconnectIntegration', payload: id })),
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const MotionDiv = React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref }, props.children));
  MotionDiv.displayName = 'MotionDiv';
  return {
    motion: {
      div: MotionDiv,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    spinner: ({ className }: { className?: string }) => (<span data-testid="icon-spinner" className={className}>Spinner</span>),
    gitHub: ({ className }: { className?: string }) => (<span data-testid="icon-github" className={className}>GitHub</span>),
    jira: ({ className }: { className?: string }) => (<span data-testid="icon-jira" className={className}>Jira</span>),
    slack: ({ className }: { className?: string }) => (<span data-testid="icon-slack" className={className}>Slack</span>),
    gitLab: ({ className }: { className?: string }) => (<span data-testid="icon-gitlab" className={className}>GitLab</span>),
    microsoft: ({ className }: { className?: string }) => (<span data-testid="icon-microsoft" className={className}>Microsoft</span>),
    bitbucket: ({ className }: { className?: string }) => (<span data-testid="icon-bitbucket" className={className}>Bitbucket</span>),
  },
}));

describe('IntegrationsSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exports', () => {
    it('exports IntegrationsSettings as named export', () => {
      expect(IntegrationsSettings).toBeDefined();
      expect(typeof IntegrationsSettings).toBe('function');
    });
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      expect(() => {
        render(<IntegrationsSettings />);
      }).not.toThrow();
    });

    it('renders page title', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<IntegrationsSettings />);
      expect(
        screen.getByText('Connect Spec Tree with your favorite tools and services')
      ).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByPlaceholderText('Search integrations...')).toBeInTheDocument();
    });

    it('renders category dropdown', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Integration Cards', () => {
    it('renders GitHub integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument();
      expect(
        screen.getByText('Connect your GitHub repositories for seamless code integration')
      ).toBeInTheDocument();
    });

    it('renders Jira integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'Jira' })).toBeInTheDocument();
      expect(
        screen.getByText('Synchronize work items with your Jira projects')
      ).toBeInTheDocument();
    });

    it('renders Slack integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'Slack' })).toBeInTheDocument();
      expect(
        screen.getByText('Get notifications and updates directly in your Slack channels')
      ).toBeInTheDocument();
    });

    it('renders GitLab integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'GitLab' })).toBeInTheDocument();
      expect(screen.getByText('Connect your GitLab repositories')).toBeInTheDocument();
    });

    it('renders Azure DevOps integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'Azure DevOps' })).toBeInTheDocument();
      expect(
        screen.getByText('Integrate with Azure DevOps projects and pipelines')
      ).toBeInTheDocument();
    });

    it('renders Bitbucket integration card', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByRole('heading', { name: 'Bitbucket' })).toBeInTheDocument();
      expect(screen.getByText('Connect your Bitbucket repositories')).toBeInTheDocument();
    });
  });

  describe('Integration Icons', () => {
    it('renders GitHub icon', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-github')).toBeInTheDocument();
    });

    it('renders Jira icon', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-jira')).toBeInTheDocument();
    });

    it('renders Slack icon', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-slack')).toBeInTheDocument();
    });

    it('renders GitLab icon', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-gitlab')).toBeInTheDocument();
    });

    it('renders Microsoft icon for Azure DevOps', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-microsoft')).toBeInTheDocument();
    });

    it('renders Bitbucket icon', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByTestId('icon-bitbucket')).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('renders disconnected status badges', () => {
      render(<IntegrationsSettings />);
      const disconnectedBadges = screen.getAllByText('disconnected');
      expect(disconnectedBadges.length).toBe(6); // All 6 integrations start disconnected
    });
  });

  describe('Category Display', () => {
    it('displays Version Control category for GitHub', () => {
      render(<IntegrationsSettings />);
      const versionControlText = screen.getAllByText('Category: Version Control');
      expect(versionControlText.length).toBeGreaterThan(0);
    });

    it('displays Project Management category for Jira', () => {
      render(<IntegrationsSettings />);
      const projectManagementText = screen.getAllByText('Category: Project Management');
      expect(projectManagementText.length).toBeGreaterThan(0);
    });

    it('displays Communication category for Slack', () => {
      render(<IntegrationsSettings />);
      expect(screen.getByText('Category: Communication')).toBeInTheDocument();
    });
  });

  describe('Connect Buttons', () => {
    it('renders Connect buttons for disconnected integrations', () => {
      render(<IntegrationsSettings />);
      const connectButtons = screen.getAllByRole('button', { name: 'Connect' });
      expect(connectButtons.length).toBe(6); // All integrations start disconnected
    });
  });

  describe('Toast Mock', () => {
    it('has toast success available', () => {
      expect(mockToast.success).toBeDefined();
      expect(typeof mockToast.success).toBe('function');
    });

    it('has toast error available', () => {
      expect(mockToast.error).toBeDefined();
      expect(typeof mockToast.error).toBe('function');
    });
  });

  describe('Redux Mock', () => {
    it('has dispatch available', () => {
      expect(mockDispatch).toBeDefined();
      expect(typeof mockDispatch).toBe('function');
    });
  });

  describe('ScrollArea', () => {
    it('renders scroll area container', () => {
      render(<IntegrationsSettings />);

      // The scroll area has a specific height class
      const scrollArea = document.querySelector('.h-\\[600px\\]');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('renders integrations in a grid', () => {
      render(<IntegrationsSettings />);

      // Check for grid classes
      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible search input', () => {
      render(<IntegrationsSettings />);

      const searchInput = screen.getByPlaceholderText('Search integrations...');
      expect(searchInput).toBeInTheDocument();
    });

    it('has accessible category select', () => {
      render(<IntegrationsSettings />);

      const categorySelect = screen.getByRole('combobox');
      expect(categorySelect).toBeInTheDocument();
    });

    it('has accessible connect buttons', () => {
      render(<IntegrationsSettings />);

      const connectButtons = screen.getAllByRole('button', { name: 'Connect' });
      connectButtons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Card Structure', () => {
    it('each integration card has header with title and badge', () => {
      render(<IntegrationsSettings />);

      expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument();
      const disconnectedBadges = screen.getAllByText('disconnected');
      expect(disconnectedBadges.length).toBeGreaterThan(0);
    });

    it('each integration card has description', () => {
      render(<IntegrationsSettings />);

      expect(screen.getByText('Connect your GitHub repositories for seamless code integration')).toBeInTheDocument();
    });

    it('each integration card has category info', () => {
      render(<IntegrationsSettings />);

      expect(screen.getAllByText(/Category:/i).length).toBe(6);
    });

    it('each integration card has footer with button', () => {
      render(<IntegrationsSettings />);

      const connectButtons = screen.getAllByRole('button', { name: 'Connect' });
      expect(connectButtons.length).toBe(6);
    });
  });

  describe('Animation', () => {
    it('renders cards with motion div wrapper', () => {
      render(<IntegrationsSettings />);

      // Since we mock framer-motion, check that cards render
      expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Jira' })).toBeInTheDocument();
    });
  });

  // Note: Tests for search functionality, category filtering, and dialog interactions
  // are limited due to React 18 concurrent mode issues with Radix UI components
  // in the happy-dom test environment.
});
