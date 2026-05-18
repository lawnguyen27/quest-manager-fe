import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';
import { mapApiRoleToUi } from '../../utils/role';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

function parseStoredUser(raw: string | null): User | null {
  if (raw == null || raw === '' || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

const parsedSavedUser: User | null = parseStoredUser(localStorage.getItem('user'));
const normalizedSavedUser: User | null = parsedSavedUser
  ? {
      ...parsedSavedUser,
      roleName: mapApiRoleToUi(parsedSavedUser.roleName),
    }
  : null;

const initialState: AuthState = {
  user: normalizedSavedUser,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      const normalizedUser: User = {
        ...user,
        roleName: mapApiRoleToUi(user.roleName),
      };
      state.user = normalizedUser;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
