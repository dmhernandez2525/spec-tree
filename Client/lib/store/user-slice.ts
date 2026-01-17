import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserAttributes } from '@/types/user';
import {
  refreshUser as refreshUserCall,
  updateUserInfo,
  getUserRole,
} from '@/api/fetchData';
import type { AppDispatch } from './index';

interface UserState {
  user: UserAttributes | null;
  token: string | null;
}

interface UpdateUserProfilePayload {
  userId: number | string;
  newUserData: Partial<UserAttributes>;
  isPos?: boolean;
  posUserId: number | string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

export const updateUserProfile = createAsyncThunk<
  UserAttributes | false,
  UpdateUserProfilePayload,
  { dispatch: AppDispatch }
>(
  'user/updateUserProfile',
  async ({ userId, newUserData }, { dispatch }) => {
    await updateUserInfo({
      userId: `${userId}`,
      data: newUserData,
    });

    const response = await refreshUser(dispatch);
    return response;
  }
);

export const refreshUser = async (dispatch: AppDispatch): Promise<UserAttributes | false> => {
  const token = localStorage.getItem('token');
  try {
    const response = await refreshUserCall(token as string);
    const userRoleResponse = await getUserRole(token as string);
    if (response && userRoleResponse) {
      dispatch(setUser(response));
      return response;
    }
    return false;
  } catch {
    return false;
  }
};

interface LoginCredentials {
  identifier: string;
  password: string;
}

export const loginUser = async (
  dispatch: AppDispatch,
  { identifier, password }: LoginCredentials
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      }
    );

    const data = await response.json();

    if (data && data.jwt) {
      localStorage.setItem('token', data.jwt);
      // const userRoleResponse = await getUserRole(data.jwt);

      dispatch(setToken(data.jwt));
      dispatch(setUser(data.user));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserAttributes | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.fulfilled, (_state, _action) => {
        // Handle successful profile update
      })
      .addCase(updateUserProfile.rejected, (_state, _action) => {
        // Handle profile update rejection
      });
  },
});

export const { setUser, setToken, clearUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
