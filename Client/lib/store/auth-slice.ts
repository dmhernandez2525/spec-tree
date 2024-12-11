import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrganizationRole } from '@/types/organization';

interface AuthState {
  isLoggedIn: boolean;
  organizationRole?: OrganizationRole;
  organizationId?: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  organizationRole: undefined,
  organizationId: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logIn: (
      state,
      action: PayloadAction<{
        organizationRole?: OrganizationRole;
        organizationId?: string;
      }>
    ) => {
      state.isLoggedIn = true;
      state.organizationRole = action.payload.organizationRole;
      state.organizationId = action.payload.organizationId;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.organizationRole = undefined;
      state.organizationId = undefined;
      localStorage.removeItem('token');
    },
    updateOrganizationRole: (
      state,
      action: PayloadAction<OrganizationRole>
    ) => {
      state.organizationRole = action.payload;
    },
  },
});

export const { logIn, logOut, updateOrganizationRole } = authSlice.actions;
export const authReducer = authSlice.reducer;
