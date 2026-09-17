import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const DailyMonitoringPage = lazy(
  () => import("@/app/components/pages/DailyMonitoringPage"),
);

const useDailyMonitoringRouter = (): RouteObject[] => [
  {
    path: "daily-monitoring",
    element: (
      <AppRouteGuard>
        <DailyMonitoringPage />
      </AppRouteGuard>
    ),
  },
];

export { useDailyMonitoringRouter };
