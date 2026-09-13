// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
const LandingPage = lazy(() => import("@/app/components/pages/LandingPage"));
const OloPage = lazy(() => import("@/app/components/pages/OloPage"));

/** Landing pemilih dashboard plus dashboard yang belum tersedia. */
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
