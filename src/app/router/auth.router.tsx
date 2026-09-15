import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

import { CONFIRM_PATHS } from "@/app/config/auth.config";

const LoginPage = lazy(() => import("@/app/components/pages/LoginPage"));
const AuthConfirmPage = lazy(
  () => import("@/app/components/pages/AuthConfirmPage"),
);

const useAuthRouter = (): RouteObject[] => [
  {
    path: "login",
    element: (
      <AppRouteGuard>
        <LoginPage />
      </AppRouteGuard>
    ),
  },
];

const useAuthConfirmRouter = (): RouteObject[] =>
  CONFIRM_PATHS.map((path) => ({
    path: path.replace(/^\//, ""),
    element: <AuthConfirmPage />,
  }));

export { useAuthConfirmRouter, useAuthRouter };
