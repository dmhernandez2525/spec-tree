import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CollaborationActivity,
  CollaborationMode,
} from '@/types/collaboration';
import type { RootState } from './index';

interface CollaborationState {
  mode: CollaborationMode;
  isEnabled: boolean;
  activity: CollaborationActivity[];
}

const initialState: CollaborationState = {
  mode: 'edit',
  isEnabled: true,
  activity: [],
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
  },
});

export const { setMode, setEnabled, toggleMode, addActivity, clearActivity } =
  collaborationSlice.actions;

export const selectCollaborationMode = (state: RootState) =>
  state.collaboration.mode;
export const selectCollaborationEnabled = (state: RootState) =>
  state.collaboration.isEnabled;
export const selectCollaborationActivity = (state: RootState) =>
  state.collaboration.activity;

export const collaborationReducer = collaborationSlice.reducer;
