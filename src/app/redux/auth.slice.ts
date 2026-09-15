import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { LOGIN_PATH } from "@/app/config/auth.config";

import type { AuthAuthenticatedUser } from "@/app/types/auth/auth.types";

import {
  clearAuthData,
  getCurrentUser,
  isAuthenticated,
} from "@/app/utils/auth.utils";

interface AuthState {
  auth_authenticatedUser: AuthAuthenticatedUser | null;
  isAuthenticated: boolean;
}

const AUTH_SLICE_INITIAL_STATE: AuthState = {
  auth_authenticatedUser: getCurrentUser(),
  isAuthenticated: isAuthenticated(),
};

const auth = createSlice({
  name: "auth",
  initialState: AUTH_SLICE_INITIAL_STATE,
  reducers: {
    authSetAuthenticatedUser: (
      state,
      { payload }: PayloadAction<AuthAuthenticatedUser>,
    ): void => {
      state.auth_authenticatedUser = payload;
      state.isAuthenticated = true;
    },
    authLogout: (state) => {
      state.auth_authenticatedUser = null;
      state.isAuthenticated = false;
      clearAuthData();
      window.location.href = LOGIN_PATH;
    },
    authInitializeFromStorage: (state) => {
      state.auth_authenticatedUser = getCurrentUser();
      state.isAuthenticated = isAuthenticated();
    },
  },
});

export const {
  authSetAuthenticatedUser,
  authLogout,
  authInitializeFromStorage,
} = auth.actions;

export default auth.reducer;
