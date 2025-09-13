import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { IAuthAuthenticatedUser } from "../types/auth.interface";

interface AuthState {
  auth_authenticatedUser: IAuthAuthenticatedUser | null;
  isAuthenticated: boolean;
}

const getUserFromStorage = (): IAuthAuthenticatedUser | null => {
  try {
    const userData = localStorage.getItem("user_data");
    const accessToken = localStorage.getItem("access_token");

    if (userData && accessToken) {
      const parsedData = JSON.parse(userData);
      return {
        ...parsedData,
        access_token: accessToken,
      };
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

const AUTH_SLICE_INITIAL_STATE: AuthState = {
  auth_authenticatedUser: getUserFromStorage(),
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const auth = createSlice({
  name: "auth",
  initialState: AUTH_SLICE_INITIAL_STATE,
  reducers: {
    authSetAuthenticatedUser: (
      state,
      { payload }: PayloadAction<IAuthAuthenticatedUser>
    ): void => {
      state.auth_authenticatedUser = payload;
      state.isAuthenticated = true;
    },
    authLogout: (state) => {
      state.auth_authenticatedUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    },
    authInitializeFromStorage: (state) => {
      const userData = getUserFromStorage();
      const hasToken = !!localStorage.getItem("access_token");

      state.auth_authenticatedUser = userData;
      state.isAuthenticated = hasToken;
    },
  },
});

// Mutations
export const {
  authSetAuthenticatedUser,
  authLogout,
  authInitializeFromStorage,
} = auth.actions;

export default auth.reducer;
