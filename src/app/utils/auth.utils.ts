import { getMenuRedirectPath, getVisibleMenus } from "@/app/config/menuConfig";
import {
  AUTH_STORAGE_KEYS,
  CNOP_FALLBACK_PATH,
  CONFIRM_PATH,
  LANDING_PATH,
  MOBILE_BREAKPOINT,
} from "@/app/config/auth.config";

import type {
  AuthAuthenticatedUser,
  AuthLoginResponse,
  AuthStoredUser,
  AuthUserDetailResponse,
} from "@/app/types/auth/auth.types";

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && value !== "";

const readStoredUser = <TUser = AuthStoredUser>(): TUser | null => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.user) ?? "null");
  } catch {
    return null;
  }
};

export const setAuthData = (response: AuthLoginResponse) => {
  if (response.status && response.token) {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, response.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(response.user));
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

export const saveStoredUser = (user: AuthStoredUser) =>
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

export const getAuthStoredUser = () => readStoredUser<AuthStoredUser>();

export const isAuthenticated = (): boolean =>
  !!localStorage.getItem(AUTH_STORAGE_KEYS.token);

export const isUserAccessPending = (
  user?: Partial<Pick<AuthAuthenticatedUser, "level" | "level_user">> | AuthStoredUser | null,
) => !hasValue(user?.level) || !hasValue(user?.level_user);

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);

    if (userData && accessToken) {
      return { ...JSON.parse(userData), access_token: accessToken };
    }

    return null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

const isMobileDevice = () =>
  typeof window !== "undefined" &&
  (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= MOBILE_BREAKPOINT);

export const getCnopRedirectPath = (): string => {
  try {
    const user = readStoredUser<{ level?: string }>();
    if (!user) return CNOP_FALLBACK_PATH;

    const visibleMenus = getVisibleMenus(user.level);

    if (isMobileDevice()) {
      const hasDailyMonitoringAccess = visibleMenus.some(
        (menu) =>
          menu.key === "sla" &&
          menu.options?.some((option) => option.value === "daily-monitoring"),
      );

      if (hasDailyMonitoringAccess) return "/daily-monitoring";
    }

    const firstVisibleMenu = visibleMenus[0];

    return firstVisibleMenu
      ? getMenuRedirectPath(firstVisibleMenu)
      : CNOP_FALLBACK_PATH;
  } catch {
    return CNOP_FALLBACK_PATH;
  }
};

export const getPostLoginRedirectPath = (): string => {
  const user = readStoredUser();
  if (!user) return LANDING_PATH;

  return isUserAccessPending(user) ? CONFIRM_PATH : LANDING_PATH;
};

export const pickUserFromDetail = (
  response: AuthUserDetailResponse | undefined,
): AuthStoredUser | null => {
  if (!response || typeof response !== "object") return null;

  return response.data ?? response.user ?? response;
};
