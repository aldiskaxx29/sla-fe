import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";
const EbisKpiPage = lazy(() => import("@/app/components/pages/EbisKpiPage"));
const useEbisRouter = (): RouteObject[] => {
  return [
    {
      path: "ebis",
      element: <Navigate to="/ebis/kpi" replace />,
    },
    {
      path: "ebis/kpi",
      element: (
        <AppRouteGuard>
          <EbisKpiPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useEbisRouter };
