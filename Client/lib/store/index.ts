// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth-slice';
import { userReducer } from './user-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
