import { emptySplitApi } from "@/app/redux/app.rtx";
import { IAuthLoginRequest, IAuthLoginResponse } from "../types/auth.interface";

const setAuthData = (response: IAuthLoginResponse) => {
  if (response.status && response.token) {
    localStorage.setItem("access_token", response.token);
    localStorage.setItem("user_data", JSON.stringify(response.user));
  }
};

const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

export const getCurrentUser = () => {
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

export const authApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IAuthLoginResponse, IAuthLoginRequest>({
      query: ({ email, password }) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        return {
          method: "POST",
          url: "login",
          body: formData,
        };
      },
      transformResponse: (response: IAuthLoginResponse) => {
        return response;
      },
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Login failed",
      }),
    }),

    login_2fa: builder.mutation<IAuthLoginResponse, IAuthLoginRequest>({
      query: (body) => {
        return {
          method: "POST",
          url: "login/2fa",
          body,
        };
      },
      transformResponse: (response: IAuthLoginResponse) => {
        console.log(response, "RESP 2FA");

        setAuthData(response);
        return response;
      },
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Login failed",
      }),
    }),

    resetToken: builder.mutation<IAuthLoginResponse, IAuthLoginRequest>({
      query: (body) => {
        return {
          method: "POST",
          url: "reset2fa",
          body,
        };
      },
      transformResponse: (response: IAuthLoginResponse) => {
        console.log(response, "RESP Reset Token");

        setAuthData(response);
        return response;
      },
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Login failed",
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        method: "POST",
        url: "logout",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          clearAuthData();
          dispatch(authApi.util.resetApiState());
        } catch (error: unknown) {
          if (error && typeof error === "object" && "data" in error) {
            console.log(error.data);
          } else {
            console.log(error);
          }
        }
      },
    }),
<<<<<<< HEAD
=======

>>>>>>> 6354a4b0266037d4693628ef77724ba22da01c5a
  }),
  overrideExisting: false,
});

<<<<<<< HEAD
export const { useLoginMutation, useLogoutMutation, useLogin_2faMutation } =
=======
export const { useLoginMutation, useLogoutMutation, useLogin_2faMutation, useResetTokenMutation } =
>>>>>>> 6354a4b0266037d4693628ef77724ba22da01c5a
  authApi;
