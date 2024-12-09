import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserAttributes } from '@/types/main';
import {
  refreshUser as refreshUserCall,
  updateUserInfo,
  getUserRole,
} from '@/api/fetchData';

interface UserState {
  user: UserAttributes | null;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (
    {
      userId,
      newUserData,
    }: {
      userId: number | string;
      newUserData: Partial<UserAttributes>;
      isPos?: boolean;
      posUserId: number | string | null;
    },
    { dispatch }
  ) => {
    try {
      await updateUserInfo({
        userId: `${userId}`,
        data: newUserData,
      });

      const response = await refreshUser(dispatch);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const refreshUser = async (dispatch: any) => {
  const token = localStorage.getItem('token');
  try {
    const response = await refreshUserCall(token as string);
    const userRoleResponse = await getUserRole(token as string);
    if (response && userRoleResponse) {
      dispatch(setUser(response));
      return response;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

export const loginUser = async (
  dispatch: any,
  { identifier, password }: { identifier: string; password: string }
) => {
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
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
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
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // Handle successful profile update

        // TODO: use state, action and remove console.log
        console.log({ state, action });
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        // TODO: use state, action and remove console.log
        console.log({ state, action });
      });
  },
});

export const { setUser, setToken, clearUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
