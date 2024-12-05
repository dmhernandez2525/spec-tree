import { configureStore } from '@reduxjs/toolkit';
import sowReducer from './slices/sow-slice';
import { SowState } from '../types/work-items';

export const store = configureStore({
  reducer: {
    sow: sowReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = {
  sow: SowState;
};

export type AppDispatch = typeof store.dispatch;
