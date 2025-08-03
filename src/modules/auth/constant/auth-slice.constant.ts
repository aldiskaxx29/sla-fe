// Interfaces
import { IAuthSliceInitialState } from "../interfaces/auth-slice.interface";

export const AUTH_SLICE_INITIAL_STATE: IAuthSliceInitialState = {
  auth_authenticatedUser: {
    id: null,
    firstName: null,
    lastName: null,
    email: null,
    telephone: null,
    status: null,
    role: "",
  },
};
