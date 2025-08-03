// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const Dashboard = lazy(() => import("@/modules/dashboard/pages/Dashboard"));
const DetailParameter = lazy(
  () => import("@/modules/dashboard/pages/DetailParameter")
);

const useDashboardRouter = (): RouteObject[] => {
  return [
    {
      path: "sla/:menuId",
      element: (
        <AppRouteGuard>
          <Dashboard />
        </AppRouteGuard>
      ),
    },
    {
      path: "dashboard/:menuId/:detailParameter",
      element: (
        <AppRouteGuard>
          <DetailParameter />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useDashboardRouter };
