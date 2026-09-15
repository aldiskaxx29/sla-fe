import type {
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthResetTokenResponse,
} from "@/app/types/auth/auth.types";

const MOCK_DELAY = 500;

const MOCK_ENCRYPTED_USER_ID =
  "eyJpdiI6Im1vY2stdXNlci1pZCIsInZhbHVlIjoibW9jay0xMjMifQ==";

export const isAuthMockEnabled = () => import.meta.env.VITE_USE_MOCK === "true";

export const resolveMock = <TResponse>(data: TResponse) =>
  new Promise<TResponse>((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));

export const AUTH_MOCK = {
  login: {
    status: true,
    requires_otp_email: true,
    message: "Silahkan periksa email Anda untuk menerima kode OTP. (MOCK)",
    user_id: 2158,
    otp_expires_in: 600,
  } satisfies AuthLoginResponse,
  verifyOtpEmail: {
    status: true,
    requires_2fa_setup: true,
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth%3A%2F%2Ftotp%2FQosmo%3Amockuser%3Fsecret%3DMOCKSECRET%26issuer%3DQosmo",
    user_id: MOCK_ENCRYPTED_USER_ID,
  } satisfies AuthLoginResponse,
  resendOtpEmail: {
    status: true,
    message: "OTP baru telah dikirim ke email (MOCK)",
    otp_expires_in: 600,
  } satisfies AuthLoginResponse,
  resetToken: {
    status: true,
    requires_otp_email: true,
    message:
      "Silahkan periksa email Anda untuk menerima kode OTP reset 2FA. (MOCK)",
    user_id: 2158,
    otp_expires_in: 600,
  } satisfies AuthResetTokenResponse,
  login2fa: {
    status: true,
    message: "2FA berhasil diaktifkan (MOCK)",
    token: "mock-token-123|abc",
    user: {
      nik: "mockuser",
      name: "Mock User",
      email: "mock@example.com",
      level_user: 1,
      level: "Administrator",
      treg: "0",
      id_telegram: "",
      unit: "regional",
      status: 0,
      last_login: "2026-05-07 12:00:00",
    },
  } satisfies AuthLoginResponse,
  logout: { status: true } satisfies AuthLogoutResponse,
};
