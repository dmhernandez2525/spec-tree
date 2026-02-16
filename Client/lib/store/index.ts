import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth-slice';
import { userReducer } from './user-slice';
import { organizationReducer } from './organization-slice';
import { settingsReducer } from './settings-slice';
import subscriptionReducer from './subscription-slice';
import sowReducer from './sow-slice';
import demoReducer from './demo-slice';
import { collaborationReducer } from './collaboration-slice';
import commentsReducer from './comments-slice';
import { workspaceReducer } from './workspace-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      organization: organizationReducer,
      workspace: workspaceReducer,
      settings: settingsReducer,
      subscription: subscriptionReducer,
      sow: sowReducer,
      demo: demoReducer,
      collaboration: collaborationReducer,
      comments: commentsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
