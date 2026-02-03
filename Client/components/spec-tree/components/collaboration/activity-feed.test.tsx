import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityFeed from './activity-feed';
import type { CollaborationActivity } from '@/types/collaboration';

describe('ActivityFeed', () => {
  it('renders empty state when no activity', () => {
    render(<ActivityFeed items={[]} />);

    expect(
      screen.getByText('No activity yet. Start collaborating to see updates here.')
    ).toBeInTheDocument();
  });

  it('renders activity entries', () => {
    const items: CollaborationActivity[] = [
      {
        id: 'activity-1',
        userId: 'user-1',
        userName: 'Avery Kim',
        action: 'created',
        targetType: 'epic',
        targetTitle: 'Authentication',
        timestamp: new Date().toISOString(),
      },
    ];

    render(<ActivityFeed items={items} />);

    expect(screen.getByText(/Avery Kim/)).toBeInTheDocument();
    expect(screen.getByText(/Authentication/)).toBeInTheDocument();
  });
});
