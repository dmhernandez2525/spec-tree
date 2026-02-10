import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import useCollaborationPresence from './useCollaborationPresence';
import type { PresenceUser } from '@/types/collaboration';
import { createTestStore } from '@/src/test/test-utils';

const currentUser: PresenceUser = {
  id: 'current-user',
  name: 'Jamie Parker',
  color: '#6366f1',
  status: 'active',
  lastActive: new Date().toISOString(),
};

describe('useCollaborationPresence', () => {
  it('includes the current user in the presence list', async () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => useCollaborationPresence({ currentUser, initialUsers: [] }),
      {
        wrapper: ({ children }) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );
    await waitFor(() => {
      expect(result.current.presenceUsers[0]?.id).toBe('current-user');
    });
  });

  it('updates current item for the active user', async () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => useCollaborationPresence({ currentUser, initialUsers: [] }),
      {
        wrapper: ({ children }) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

    act(() => {
      result.current.setActiveItem('item-123');
    });

    await waitFor(() => {
      expect(result.current.presenceUsers[0]?.currentItemId).toBe('item-123');
    });
  });
});
