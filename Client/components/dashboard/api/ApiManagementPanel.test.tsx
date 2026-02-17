import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import ApiManagementPanel from './ApiManagementPanel';

vi.mock('./ApiKeyList', () => ({
  default: () => <div data-testid="api-key-list">ApiKeyList</div>,
}));

vi.mock('./ApiUsageDashboard', () => ({
  default: () => <div data-testid="api-usage-dashboard">ApiUsageDashboard</div>,
}));

vi.mock('./ApiDocsViewer', () => ({
  default: () => <div data-testid="api-docs-viewer">ApiDocsViewer</div>,
}));

describe('ApiManagementPanel', () => {
  const initialState = {
    restApi: {
      keys: [],
      usage: null,
      usageHistory: [],
      isLoading: false,
      error: null,
    },
  };

  it('renders the panel title', () => {
    render(<ApiManagementPanel />, { initialState: initialState as never });
    expect(screen.getByText('REST API')).toBeInTheDocument();
  });

  it('renders tab triggers', () => {
    render(<ApiManagementPanel />, { initialState: initialState as never });
    expect(screen.getByRole('tab', { name: /api keys/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /usage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /documentation/i })).toBeInTheDocument();
  });

  it('renders API key list by default', () => {
    render(<ApiManagementPanel />, { initialState: initialState as never });
    expect(screen.getByTestId('api-key-list')).toBeInTheDocument();
  });

  it('switches to usage tab', async () => {
    const { user } = render(<ApiManagementPanel />, { initialState: initialState as never });
    await user.click(screen.getByRole('tab', { name: /usage/i }));
    expect(screen.getByTestId('api-usage-dashboard')).toBeInTheDocument();
  });

  it('switches to docs tab', async () => {
    const { user } = render(<ApiManagementPanel />, { initialState: initialState as never });
    await user.click(screen.getByRole('tab', { name: /documentation/i }));
    expect(screen.getByTestId('api-docs-viewer')).toBeInTheDocument();
  });
});
