import { emptySplitApi } from "@/app/redux/app.rtx";
import {
  IAuthLoginRequest,
  IAuthLoginResponse,
  IAuthVerifyOtpEmailRequest,
  IAuthLogin2faRequest,
  IAuthResendOtpEmailRequest,
  IAuthResetTokenRequest,
  IAuthResetTokenResponse,
} from "../types/auth.interface";

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
    /** Step 1: Login dengan NIK & Password */
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
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Login gagal. Periksa kembali NIK dan password Anda.",
      }),
    }),

    /** Step 2a: Verifikasi OTP yang dikirim ke email (first login / setup 2FA) */
    verifyOtpEmail: builder.mutation<IAuthLoginResponse, IAuthVerifyOtpEmailRequest>({
      query: (body) => ({
        method: "POST",
        url: "login/verify-otp-email",
        body,
      }),
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Kode OTP Email tidak valid.",
      }),
    }),

    /** Resend OTP Email */
    resendOtpEmail: builder.mutation<IAuthLoginResponse, IAuthResendOtpEmailRequest>({
      query: (body) => ({
        method: "POST",
        url: "login/resend-otp-email",
        body,
      }),
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Gagal mengirim ulang OTP.",
      }),
    }),

    /** Step 2b: Verifikasi kode Authenticator (login/2fa) */
    login_2fa: builder.mutation<IAuthLoginResponse, IAuthLogin2faRequest>({
      query: (body) => ({
        method: "POST",
        url: "login/2fa",
        body,
      }),
      transformResponse: (response: IAuthLoginResponse) => {
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
          "Kode Authenticator tidak valid.",
      }),
    }),

    /** Reset Token 2FA (ketika user tidak punya akses authenticator) */
    resetToken: builder.mutation<IAuthResetTokenResponse, IAuthResetTokenRequest>({
      query: (body) => ({
        method: "POST",
        url: "reset2fa",
        body,
      }),
      transformErrorResponse: (
        response:
          | import("@reduxjs/toolkit/query").FetchBaseQueryError
          | { data?: { message?: string } }
      ) => ({
        status: "status" in response ? response.status : undefined,
        message:
          (response as { data?: { message?: string } })?.data?.message ||
          "Gagal mereset token 2FA.",
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
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useLogin_2faMutation,
  useResetTokenMutation,
  useVerifyOtpEmailMutation,
  useResendOtpEmailMutation,
} = authApi;
