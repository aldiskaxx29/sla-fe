export type AuthUserId = string | number;

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthVerifyOtpEmailRequest {
  user_id: AuthUserId;
  otp: string;
}

export interface AuthLogin2faRequest {
  user_id: AuthUserId;
  code: string;
}

export interface AuthResendOtpEmailRequest {
  user_id: AuthUserId;
}

export interface AuthResetTokenRequest {
  user_id: AuthUserId;
}

export interface AuthResetTokenResponse {
  status: boolean;
  message?: string;
  requires_otp_email?: boolean;
  user_id?: AuthUserId;
  otp_expires_in?: number;
}

export interface AuthAuthenticatedUser {
  nik: string;
  name: string;
  email: string;
  level_user: number;
  level: string;
  treg: string;
  id_telegram: string;
  unit: string;
  status: number;
  last_login: string;
  access_token?: string;
}

export interface AuthLoginResponse {
  status: boolean;
  message?: string;
  requires_otp_email?: boolean;
  user_id?: AuthUserId;
  otp_expires_in?: number;
  requires_2fa?: boolean;
  requires_2fa_setup?: boolean;
  qr_code_url?: string;
  token?: string;
  user?: AuthAuthenticatedUser;
}

export interface AuthLogoutResponse {
  status?: boolean;
  message?: string;
}

export interface AuthStoredUser {
  id?: AuthUserId;
  user_id?: AuthUserId;
  level?: string | null;
  level_user?: number | null;
  [key: string]: unknown;
}

export type AuthUserDetailResponse = {
  data?: AuthStoredUser;
  user?: AuthStoredUser;
} & AuthStoredUser;

export interface AuthPendingLogin {
  user_id: AuthUserId;
  otp_expires_in?: number;
  requires_2fa?: boolean;
}

export type TwoFactorStep =
  | "EMAIL_OTP"
  | "SCAN_QR"
  | "AUTHENTICATOR"
  | "EMAIL_RESET";
