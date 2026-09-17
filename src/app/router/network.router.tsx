import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const PeHsiMonitoringPage = lazy(
  () => import("@/app/components/pages/PeHsiMonitoringPage"),
);

/** Submenu Network Performance yang sudah memakai arsitektur baru. */
const useNetworkPerformanceRouter = (): RouteObject[] => [
  {
    path: "network/pe-hsi",
    element: (
      <AppRouteGuard>
        <PeHsiMonitoringPage />
      </AppRouteGuard>
    ),
  },
];

export { useNetworkPerformanceRouter };
