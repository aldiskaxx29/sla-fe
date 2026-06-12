import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const DailyMonitoring = lazy(
  () => import("@/modules/daily-monitoring/pages/DailyMonitoringPage")
);

const useDailyMonitoringRouter = (): RouteObject[] => {
  return [
    {
      path: "daily-monitoring",
      element: (
        <AppRouteGuard>
          <DailyMonitoring />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useDailyMonitoringRouter };
