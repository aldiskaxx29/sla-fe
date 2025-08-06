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
      path: "input-site",
      element: (
        <AppRouteGuard>
          <InputSite />
        </AppRouteGuard>
      ),
    },
    {
      path: "report-site",
      element: (
        <AppRouteGuard>
          <ReportSite />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useSiteRouter };
