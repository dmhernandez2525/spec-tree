import { useEffect, useMemo, useState } from 'react';
import type { PresenceUser } from '@/types/collaboration';
import { mockPresenceUsers } from '../data/collaboration-presence';

interface UseCollaborationPresenceOptions {
  currentUser?: PresenceUser | null;
  initialUsers?: PresenceUser[];
}

interface UseCollaborationPresenceResult {
  presenceUsers: PresenceUser[];
  activeUsers: PresenceUser[];
  idleUsers: PresenceUser[];
  setActiveItem: (itemId: string | undefined) => void;
  setUserStatus: (status: 'active' | 'idle') => void;
}

const ensureCurrentUser = (
  users: PresenceUser[],
  currentUser?: PresenceUser | null
): PresenceUser[] => {
  if (!currentUser) {
    return users;
  }

  const exists = users.some((user) => user.id === currentUser.id);
  if (exists) {
    return users.map((user) =>
      user.id === currentUser.id ? { ...user, ...currentUser } : user
    );
  }

  return [currentUser, ...users];
};

const useCollaborationPresence = (
  options: UseCollaborationPresenceOptions = {}
): UseCollaborationPresenceResult => {
  const { currentUser, initialUsers = mockPresenceUsers } = options;
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>(() =>
    ensureCurrentUser(initialUsers, currentUser)
  );

  useEffect(() => {
    setPresenceUsers((prev) => ensureCurrentUser(prev, currentUser));
  }, [currentUser]);

  const activeUsers = useMemo(
    () => presenceUsers.filter((user) => user.status === 'active'),
    [presenceUsers]
  );

  const idleUsers = useMemo(
    () => presenceUsers.filter((user) => user.status === 'idle'),
    [presenceUsers]
  );

  const setActiveItem = (itemId: string | undefined) => {
    if (!currentUser) return;
    setPresenceUsers((prev) =>
      prev.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              currentItemId: itemId,
              status: 'active',
              lastActive: new Date().toISOString(),
            }
          : user
      )
    );
  };

  const setUserStatus = (status: 'active' | 'idle') => {
    if (!currentUser) return;
    setPresenceUsers((prev) =>
      prev.map((user) =>
        user.id === currentUser.id
          ? { ...user, status, lastActive: new Date().toISOString() }
          : user
      )
    );
  };

  return {
    presenceUsers,
    activeUsers,
    idleUsers,
    setActiveItem,
    setUserStatus,
  };
};

export default useCollaborationPresence;
