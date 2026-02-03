import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CollaborationPanel from './index';
import type { PresenceUser } from '@/types/collaboration';

const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => mockUseSelector(selector),
}));

vi.mock('./presence-indicator', () => ({
  default: () => <div data-testid="presence-indicator" />,
}));

vi.mock('./collaboration-settings', () => ({
  default: () => <div data-testid="collaboration-settings" />,
}));

vi.mock('./activity-feed', () => ({
  default: () => <div data-testid="activity-feed" />,
}));

const users: PresenceUser[] = [
  {
    id: 'user-1',
    name: 'Avery Kim',
    color: '#2563eb',
    status: 'active',
    lastActive: new Date().toISOString(),
  },
];

describe('CollaborationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collaboration status badge and trigger', () => {
    const mockState = {
      collaboration: {
        isEnabled: true,
        mode: 'read-only',
        activity: [],
      },
    };

    mockUseSelector.mockImplementation((selector) => selector(mockState));

    render(<CollaborationPanel presenceUsers={users} />);

    expect(screen.getByText('Read-only')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collaboration' })).toBeInTheDocument();
    expect(screen.getByTestId('presence-indicator')).toBeInTheDocument();
  });
});
