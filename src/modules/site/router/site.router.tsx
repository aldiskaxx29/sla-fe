// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const InputSite = lazy(() => import("@/modules/site/pages/InputSitePage"));
const ReportSite = lazy(() => import("@/modules/site/pages/ReportSitePage"));

const useSiteRouter = (): RouteObject[] => {
  return [
    {
      path: "sla/input-site",
      element: (
        <AppRouteGuard>
          <InputSite />
        </AppRouteGuard>
      ),
    },
    {
      path: "sla/report-site",
      element: (
        <AppRouteGuard>
          <ReportSite />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useSiteRouter };
