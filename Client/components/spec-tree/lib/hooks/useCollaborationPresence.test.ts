import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCollaborationPresence from './useCollaborationPresence';
import type { PresenceUser } from '@/types/collaboration';

const currentUser: PresenceUser = {
  id: 'current-user',
  name: 'Jamie Parker',
  color: '#6366f1',
  status: 'active',
  lastActive: new Date().toISOString(),
};

describe('useCollaborationPresence', () => {
  it('includes the current user in the presence list', () => {
    const { result } = renderHook(() =>
      useCollaborationPresence({ currentUser, initialUsers: [] })
    );

    expect(result.current.presenceUsers[0]?.id).toBe('current-user');
  });

  it('updates current item for the active user', () => {
    const { result } = renderHook(() =>
      useCollaborationPresence({ currentUser, initialUsers: [] })
    );

    act(() => {
      result.current.setActiveItem('item-123');
    });

    expect(result.current.presenceUsers[0]?.currentItemId).toBe('item-123');
  });
});
