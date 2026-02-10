import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CollaborationActivity,
  CollaborationMode,
  PresenceUser,
} from '@/types/collaboration';
import type { RootState } from './index';

interface CollaborationState {
  mode: CollaborationMode;
  isEnabled: boolean;
  activity: CollaborationActivity[];
  presenceUsers: PresenceUser[];
  lastUpdatedByKey: Record<string, string>;
}

const initialState: CollaborationState = {
  mode: 'edit',
  isEnabled: true,
  activity: [],
  presenceUsers: [],
  lastUpdatedByKey: {},
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<CollaborationMode>) => {
      state.mode = action.payload;
    },
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'edit' ? 'read-only' : 'edit';
    },
    addActivity: (state, action: PayloadAction<CollaborationActivity>) => {
      state.activity.unshift(action.payload);
      if (state.activity.length > 50) {
        state.activity = state.activity.slice(0, 50);
      }
    },
    clearActivity: (state) => {
      state.activity = [];
    },
    setPresenceUsers: (state, action: PayloadAction<PresenceUser[]>) => {
      state.presenceUsers = action.payload;
    },
    upsertPresenceUser: (state, action: PayloadAction<PresenceUser>) => {
      const next = action.payload;
      const index = state.presenceUsers.findIndex((user) => user.id === next.id);
      if (index >= 0) {
        state.presenceUsers[index] = { ...state.presenceUsers[index], ...next };
      } else {
        state.presenceUsers.push(next);
      }
    },
    removePresenceUser: (state, action: PayloadAction<string>) => {
      state.presenceUsers = state.presenceUsers.filter(
        (user) => user.id !== action.payload
      );
    },
    recordUpdate: (
      state,
      action: PayloadAction<{ key: string; updatedAt: string }>
    ) => {
      const { key, updatedAt } = action.payload;
      const current = state.lastUpdatedByKey[key];
      if (!current || updatedAt > current) {
        state.lastUpdatedByKey[key] = updatedAt;
      }
    },
  },
});

export const {
  setMode,
  setEnabled,
  toggleMode,
  addActivity,
  clearActivity,
  setPresenceUsers,
  upsertPresenceUser,
  removePresenceUser,
  recordUpdate,
} = collaborationSlice.actions;

export const selectCollaborationMode = (state: RootState) =>
  state.collaboration.mode;
export const selectCollaborationEnabled = (state: RootState) =>
  state.collaboration.isEnabled;
export const selectCollaborationActivity = (state: RootState) =>
  state.collaboration.activity;
export const selectCollaborationPresenceUsers = (state: RootState) =>
  state.collaboration.presenceUsers;
export const selectCollaborationLastUpdatedByKey = (state: RootState) =>
  state.collaboration.lastUpdatedByKey;

export const collaborationReducer = collaborationSlice.reducer;
