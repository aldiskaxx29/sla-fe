// Redux Toolkit
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Constant
import { AUTH_SLICE_INITIAL_STATE } from "../constant/auth-slice.constant";

// Interfaces
import { IAuthAuthenticatedUser } from "../interfaces/auth.interface";

const auth = createSlice({
  name: "auth",
  initialState: AUTH_SLICE_INITIAL_STATE,
  reducers: {
    auth_SET_AUTHENTICATED_USER: (
      state,
      { payload }: PayloadAction<IAuthAuthenticatedUser>
    ): void => {
      state.auth_authenticatedUser = payload;
    },
    auth_LOGOUT: (state) => {
      state.auth_authenticatedUser =
        AUTH_SLICE_INITIAL_STATE.auth_authenticatedUser;
    },
  },
});

// Mutations
export const { auth_SET_AUTHENTICATED_USER, auth_LOGOUT } = auth.actions;

export default auth.reducer;
