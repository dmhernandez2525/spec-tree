import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import PresenceIndicator from './presence-indicator';
import type { PresenceUser } from '@/types/collaboration';

const users: PresenceUser[] = [
  {
    id: 'user-1',
    name: 'Avery Kim',
    color: '#2563eb',
    status: 'active',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    color: '#16a34a',
    status: 'active',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-3',
    name: 'Riley Patel',
    color: '#f97316',
    status: 'idle',
    lastActive: new Date().toISOString(),
  },
];

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe('PresenceIndicator', () => {
  it('renders active count and initials', () => {
    renderWithProvider(<PresenceIndicator users={users} maxVisible={2} />);

    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('AK')).toBeInTheDocument();
    expect(screen.getByText('JL')).toBeInTheDocument();
  });

  it('shows overflow count when more users exist', () => {
    renderWithProvider(<PresenceIndicator users={users} maxVisible={1} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
