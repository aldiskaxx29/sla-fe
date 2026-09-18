// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const ReportSupportNeeded = lazy(
  () => import("@/modules/site/pages/ReportSupportNeededPage")
);
const ReportSupportBreakdown = lazy(
  () => import("@/modules/site/pages/ReportSupportBreakdownPage")
);

const useReportSupportRouter = (): RouteObject[] => {
  return [
    {
      path: "report-support-needed",
      element: (
        <AppRouteGuard>
          <ReportSupportNeeded />
        </AppRouteGuard>
      ),
    },
    {
      path: "report-support-needed/detail/:breakdown/:issue/:monthnow/:parameter",
      element: (
        <AppRouteGuard>
          <ReportSupportBreakdown />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useReportSupportRouter };
