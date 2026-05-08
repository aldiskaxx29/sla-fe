// Request interfaces
export interface IAuthLoginRequest {
  email: string;
  password: string;
}

export interface IAuthVerifyOtpEmailRequest {
  user_id: string | number;
  otp: string; // field name sesuai API: /login/verify-otp-email
}

export interface IAuthLogin2faRequest {
  user_id: string | number;
  code: string;
}

export interface IAuthResendOtpEmailRequest {
  user_id: string | number;
}

export interface IAuthResetTokenRequest {
  user_id: string | number; // /reset2fa hanya butuh user_id
}

export interface IAuthResetTokenResponse {
  status: boolean;
  message?: string;
  // BE mengembalikan user_id baru setelah reset, untuk dipakai di verify-otp-email
  requires_otp_email?: boolean;
  user_id?: string | number;
  otp_expires_in?: number;
}

// Response interfaces
export interface IAuthLoginResponse {
  status: boolean;
  message?: string;
  // Case A: First login — requires email OTP verification
  requires_otp_email?: boolean;
  user_id?: string | number; // number saat first login, string encrypted saat returning user
  otp_expires_in?: number;
  // Case B: Returning user — langsung ke authenticator
  requires_2fa?: boolean;
  // Step 2: /login/verify-otp-email — requires 2FA setup (scan QR)
  requires_2fa_setup?: boolean;
  qr_code_url?: string; // dipakai di verify-otp-email dan bisa juga di reset2fa
  // Step 3: /login/2fa — final login success
  token?: string;
  user?: IAuthAuthenticatedUser;
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
