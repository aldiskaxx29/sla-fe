// React Router DOM
import { useLocation, Navigate } from "react-router-dom";

import {
  getCurrentUser,
  getPostLoginRedirectPath,
  isAuthenticated,
} from "@/modules/auth/rtk/auth.rtk";
import { getMenuByPath, getVisibleMenus } from "@/app/config/menuConfig";

// Interfaces
import { IAppRouteGuardProps } from "./interfaces";

const AppRouteGuard = ({ children, permissible }: IAppRouteGuardProps) => {
  const location = useLocation();
  const authed = isAuthenticated();

  if (!permissible && permissible !== undefined) {
    return <Navigate to="/access-denied" replace />;
  }

  if (location.pathname === "/login") {
    return authed ? <Navigate to={getPostLoginRedirectPath()} replace /> : children;
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  const protectedMenu = getMenuByPath(location.pathname);

  if (protectedMenu) {
    const canAccess = getVisibleMenus(user?.level, [protectedMenu]).length > 0;

    if (!canAccess) {
      return <Navigate to={getPostLoginRedirectPath()} replace />;
    }
  }

  return children;
};

AppRouteGuard.displayName = "AppRouteGuard";

export { AppRouteGuard };
