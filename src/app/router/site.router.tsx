import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const ReportSitePage = lazy(
  () => import("@/app/components/pages/ReportSitePage"),
);

const useSiteRouter = (): RouteObject[] => {
  return [
    {
      path: "report-site",
      element: (
        <AppRouteGuard>
          <ReportSitePage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useSiteRouter };
