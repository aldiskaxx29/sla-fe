// Request interfaces
export interface IAuthLoginRequest {
  email: string;
  password: string;
}

export interface IAuthVerifyOtpEmailRequest {
  user_id: string | number;
  code: string;
}

export interface IAuthLogin2faRequest {
  user_id: string | number;
  code: string;
}

export interface IAuthResendOtpEmailRequest {
  user_id: string | number;
}

export interface IAuthResetTokenRequest {
  user_id: string | number;
  code: string;
}

// Response interfaces
export interface IAuthLoginResponse {
  status: boolean;
  message?: string;
  // Step 1: /login — requires email OTP
  requires_otp_email?: boolean;
  user_id?: number;
  otp_expires_in?: number;
  // Step 2: /login/verify-otp-email — requires 2FA setup (scan QR)
  requires_2fa_setup?: boolean;
  qr_code_url?: string;
  // Step 3: /login/2fa — final login success
  token?: string;
  user?: IAuthAuthenticatedUser;
  // /login/resend-otp-email
  // /reset2fa
}

export interface IAuthAuthenticatedUser {
  nik: string;
  name: string;
  email: string;
  level_user: number;
  treg: string;
  id_telegram: string;
  unit: string;
  status: number;
  last_login: string;
  access_token?: string;
}
