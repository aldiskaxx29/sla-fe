// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const AuthLogin = lazy(() => import("@/modules/auth/pages/LoginPage"));

const useAuthRouter = (): RouteObject[] => {
  return [
    {
      path: "login",
      element: (
        <AppRouteGuard>
          <AuthLogin />
        </AppRouteGuard>
      ),
    },
    {
      path: "forgot-password",
      element: (
        <AppRouteGuard>
          {/* <AuthForgotPassword /> */}
          <div>forgot pasword</div>
        </AppRouteGuard>
      ),
    },
    {
      path: "reset-password/:token",
      element: (
        <AppRouteGuard>
          {/* <AuthResetPassword /> */}
          <div>reset password</div>
        </AppRouteGuard>
      ),
    },
  ];
};

export { useAuthRouter };
