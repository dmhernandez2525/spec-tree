import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { PresenceUser } from '@/types/collaboration';
import type { AppDispatch, RootState } from '@/lib/store';
import {
  selectCollaborationPresenceUsers,
  setPresenceUsers,
  upsertPresenceUser,
} from '@/lib/store/collaboration-slice';
import { getCollaborationEmitter } from '../collaboration/collaboration-emitter';

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
  const { currentUser, initialUsers = [] } = options;
  const dispatch = useDispatch<AppDispatch>();
  const presenceUsers = useSelector((state: RootState) =>
    selectCollaborationPresenceUsers(state)
  );

  useEffect(() => {
    if (initialUsers.length > 0) {
      dispatch(setPresenceUsers(ensureCurrentUser(initialUsers, currentUser)));
      return;
    }

    if (currentUser) {
      dispatch(upsertPresenceUser(currentUser));
    }
  }, [currentUser, dispatch, initialUsers]);

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
    const updatedUser = {
      ...currentUser,
      currentItemId: itemId,
      status: 'active' as const,
      lastActive: new Date().toISOString(),
    };
    dispatch(upsertPresenceUser(updatedUser));
    getCollaborationEmitter().emitPresenceUpdate?.(updatedUser);
  };

  const setUserStatus = (status: 'active' | 'idle') => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      status,
      lastActive: new Date().toISOString(),
    };
    dispatch(upsertPresenceUser(updatedUser));
    getCollaborationEmitter().emitPresenceUpdate?.(updatedUser);
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
