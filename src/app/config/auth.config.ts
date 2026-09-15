export const AUTH_STORAGE_KEYS = {
  token: "access_token",
  user: "user_data",
} as const;

export const LOGIN_PATH = "/login";
export const LANDING_PATH = "/landing";
export const CONFIRM_PATH = "/confirm";
export const CONFIRM_PATHS = [CONFIRM_PATH, "/confirmasi"];

export const CNOP_FALLBACK_PATH = "/msa";
export const MOBILE_BREAKPOINT = 768;

export const OTP_LENGTH = 6;
