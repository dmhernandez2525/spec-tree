import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import WebhookManagementPanel from './WebhookManagementPanel';

vi.mock('./WebhookList', () => ({
  default: () => <div data-testid="webhook-list">WebhookList</div>,
}));

describe('WebhookManagementPanel', () => {
  const initialState = {
    webhooks: {
      webhooks: [],
      deliveries: [],
      templates: [],
      isLoading: false,
      error: null,
    },
  };

  it('renders the panel title', () => {
    render(<WebhookManagementPanel />, { initialState: initialState as never });

    // The heading "Webhooks" is rendered as an h2.
    // (The tab trigger also contains the word "Webhooks", so we target the heading.)
    expect(screen.getByRole('heading', { name: /webhooks/i })).toBeInTheDocument();
  });

  it('renders tab triggers for Webhooks and Templates', () => {
    render(<WebhookManagementPanel />, { initialState: initialState as never });

    expect(screen.getByRole('tab', { name: /webhooks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /templates/i })).toBeInTheDocument();
  });

  it('renders WebhookList by default', () => {
    render(<WebhookManagementPanel />, { initialState: initialState as never });

    expect(screen.getByTestId('webhook-list')).toBeInTheDocument();
  });

  it('switches to templates tab', async () => {
    const { user } = render(<WebhookManagementPanel />, {
      initialState: initialState as never,
    });

    await user.click(screen.getByRole('tab', { name: /templates/i }));

    expect(screen.getByText('Integration Templates')).toBeInTheDocument();
  });
});
