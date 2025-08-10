import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const DashboardTAPage = lazy(
  () => import("@/modules/dashboard-ta/pages/DashboardTAPage")
);
const useDashboardTARouter = (): RouteObject[] => {
  return [
    {
      path: "dashboard-ta",
      element: (
        <AppRouteGuard>
          <DashboardTAPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useDashboardTARouter };
