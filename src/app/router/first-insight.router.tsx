// React
import { lazy } from "react";

// React Router DOM
import { Navigate, RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
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
