import type { AxiosRequestConfig } from "axios";

import { apiRequest } from "@/app/api/base-url";

import type {
  AuthLogin2faRequest,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthResendOtpEmailRequest,
  AuthResetTokenRequest,
  AuthResetTokenResponse,
  AuthUserDetailResponse,
  AuthUserId,
  AuthVerifyOtpEmailRequest,
} from "@/app/types/auth/auth.types";

import { AUTH_MOCK, isAuthMockEnabled, resolveMock } from "./auth.mock";

export const AUTH_ENDPOINTS = {
  login: "login",
  verifyOtpEmail: "login/verify-otp-email",
  resendOtpEmail: "login/resend-otp-email",
  login2fa: "login/2fa",
  resetToken: "reset2fa",
  logout: "logout",
  userDetail: "users/getOne",
} as const;

const AUTH_FLOW_CONFIG: Pick<
  AxiosRequestConfig,
  "skipErrorToast" | "skipAuthRedirect"
> = {
  skipErrorToast: true,
  skipAuthRedirect: true,
};

export const postLogin = ({ email, password }: AuthLoginRequest) => {
  if (isAuthMockEnabled()) return resolveMock<AuthLoginResponse>(AUTH_MOCK.login);

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  return apiRequest<AuthLoginResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.login,
    data: formData,
    ...AUTH_FLOW_CONFIG,
  });
};

export const postVerifyOtpEmail = (payload: AuthVerifyOtpEmailRequest) => {
  if (isAuthMockEnabled()) {
    return resolveMock<AuthLoginResponse>(AUTH_MOCK.verifyOtpEmail);
  }

  return apiRequest<AuthLoginResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.verifyOtpEmail,
    data: payload,
    ...AUTH_FLOW_CONFIG,
  });
};

export const postResendOtpEmail = (payload: AuthResendOtpEmailRequest) => {
  if (isAuthMockEnabled()) {
    return resolveMock<AuthLoginResponse>(AUTH_MOCK.resendOtpEmail);
  }

  return apiRequest<AuthLoginResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.resendOtpEmail,
    data: payload,
    ...AUTH_FLOW_CONFIG,
  });
};

export const postLogin2fa = (payload: AuthLogin2faRequest) => {
  if (isAuthMockEnabled()) return resolveMock<AuthLoginResponse>(AUTH_MOCK.login2fa);

  return apiRequest<AuthLoginResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.login2fa,
    data: payload,
    ...AUTH_FLOW_CONFIG,
  });
};

export const postResetToken = (payload: AuthResetTokenRequest) => {
  if (isAuthMockEnabled()) {
    return resolveMock<AuthResetTokenResponse>(AUTH_MOCK.resetToken);
  }

  return apiRequest<AuthResetTokenResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.resetToken,
    data: payload,
    ...AUTH_FLOW_CONFIG,
  });
};

export const postLogout = () => {
  if (isAuthMockEnabled()) return resolveMock<AuthLogoutResponse>(AUTH_MOCK.logout);

  return apiRequest<AuthLogoutResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.logout,
    skipErrorToast: true,
  });
};

export const getAuthUserDetail = (id: AuthUserId, signal?: AbortSignal) =>
  apiRequest<AuthUserDetailResponse>({
    method: "GET",
    url: AUTH_ENDPOINTS.userDetail,
    params: { id },
    skipErrorToast: true,
    signal,
  });
