// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
const LandingPage = lazy(() => import("@/app/components/pages/LandingPage"));
const EbisPage = lazy(() => import("@/app/components/pages/EbisPage"));
const OloPage = lazy(() => import("@/app/components/pages/OloPage"));

/** Landing pemilih dashboard plus dua dashboard yang belum tersedia. */
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
      path: "ebis",
      element: (
        <AppRouteGuard>
          <EbisPage />
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
