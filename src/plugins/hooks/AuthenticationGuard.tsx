import { isAuthenticated } from "@/modules/auth/rtk/auth.rtk";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface GuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthRouteGuard: React.FC<GuardProps> = ({
  requireAuth = true,
  redirectTo,
  ...props
}) => {
  const location = useLocation();
  const authed = isAuthenticated();

  if (requireAuth && !authed) {
    return (
      <Navigate
        to={redirectTo || "/login"}
        state={{ from: location }}
        replace
      />
    );
  }
  if (!requireAuth && authed) {
    return (
      <Navigate to={redirectTo || "/executive"} state={{ from: location }} replace />
    );
  }
  return <Outlet {...props} />;
};
