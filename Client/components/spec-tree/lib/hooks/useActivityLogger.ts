import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store';
import {
  addActivity,
  selectCollaborationEnabled,
} from '@/lib/store/collaboration-slice';
import type { ActivityAction, ActivityTarget } from '@/types/collaboration';
import generateId from '../utils/generate-id';

const getUserId = (state: RootState): string => {
  const user = state.user.user;
  if (!user) return 'current-user';
  if (user.documentId) return user.documentId;
  if (user.id) return String(user.id);
  return 'current-user';
};

const getUserName = (state: RootState): string => {
  const user = state.user.user;
  if (!user) return 'You';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return fullName || user.username || user.email || 'You';
};

const useActivityLogger = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isEnabled = useSelector(selectCollaborationEnabled);
  const userId = useSelector(getUserId);
  const userName = useSelector(getUserName);

  const logActivity = useCallback(
    (action: ActivityAction, targetType: ActivityTarget, targetTitle: string) => {
      if (!isEnabled) return;
      dispatch(
        addActivity({
          id: generateId(),
          userId,
          userName,
          action,
          targetType,
          targetTitle,
          timestamp: new Date().toISOString(),
        })
      );
    },
    [dispatch, isEnabled, userId, userName]
  );

  return { logActivity };
};

export default useActivityLogger;
