import { lazy } from "react";

import { Navigate, RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";

const HistorySlaPage = lazy(
  () => import("@/app/components/pages/HistorySlaPage"),
);

const useFirstInsightRouter = (): RouteObject[] => {
  return [
    {
      path: "first-insight",
      element: <Navigate to="/first-insight/history-sla" replace />,
    },
    {
      path: "first-insight/history-sla",
      element: (
        <AppRouteGuard>
          <HistorySlaPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useFirstInsightRouter };
