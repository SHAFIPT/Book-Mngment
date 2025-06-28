import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/auth';
import { getAccessToken, removeAccessToken, setAccessToken } from '../utils/tokenUtils';

interface UserState {
  isAuthenticated: boolean;
  accessToken: string | null;
  role: User['role'] | null;
  user: Omit<User, 'role'> | null;
}

const initialState: UserState = {
  isAuthenticated: !!getAccessToken(),
  accessToken: getAccessToken(),
  role: null,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.user.role;
      state.user = {
        _id: action.payload.user._id,
        name: action.payload.user.name,
        email: action.payload.user.email,
        userId: action.payload.user.userId,
      };

      setAccessToken(action.payload.accessToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.role = null;
      state.user = null;
      removeAccessToken();
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;