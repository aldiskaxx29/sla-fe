import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";

const LandingPage = lazy(() => import("@/app/components/pages/LandingPage"));
const OloPage = lazy(() => import("@/app/components/pages/OloPage"));

const useLandingRouter = (): RouteObject[] => {
  return [
    {
      path: "landing",
      element: (
        <AppRouteGuard>
          <LandingPage />
        </AppRouteGuard>
      ),
    },
    {
      path: "olo",
      element: (
        <AppRouteGuard>
          <OloPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useLandingRouter };
