import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const FbbOnx = lazy(() => import("@/modules/fbb/pages/FbbOnxPage"));
const FbbOokla = lazy(() => import("@/modules/fbb/pages/FbbOoklaPage"));
const FbbSla = lazy(() => import("@/modules/fbb/pages/FbbSlaPage"));

const useFbbRouter = (): RouteObject[] => {
  return [
    {
      path: "fbb",
      element: <Navigate to="/fbb/onx" replace />,
    },
    {
      path: "fbb/onx",
      element: (
        <AppRouteGuard>
          <FbbOnx />
        </AppRouteGuard>
      ),
    },
    {
      path: "fbb/ookla",
      element: (
        <AppRouteGuard>
          <FbbOokla />
        </AppRouteGuard>
      ),
    },
    {
      path: "fbb/sla",
      element: (
        <AppRouteGuard>
          <FbbSla />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useFbbRouter };
