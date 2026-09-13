// React
import { lazy } from "react";

// React Router DOM
import { Navigate, RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
const EbisKpiPage = lazy(() => import("@/app/components/pages/EbisKpiPage"));

/** Rute EBIS; `/ebis` langsung diarahkan ke menu pertamanya. */
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
