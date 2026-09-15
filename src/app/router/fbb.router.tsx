import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";

const FbbOnxPage = lazy(() => import("@/app/components/pages/FbbOnxPage"));
const FbbOoklaPage = lazy(() => import("@/app/components/pages/FbbOoklaPage"));
const FbbSlaPage = lazy(() => import("@/app/components/pages/FbbSlaPage"));

const useFbbRouter = (): RouteObject[] => {
  return [
    {
      path: "fbb",
      element: <Navigate to="/fbb/sla" replace />,
    },
    {
      path: "fbb/onx",
      element: (
        <AppRouteGuard>
          <FbbOnxPage />
        </AppRouteGuard>
      ),
    },
    {
      path: "fbb/ookla",
      element: (
        <AppRouteGuard>
          <FbbOoklaPage />
        </AppRouteGuard>
      ),
    },
    {
      path: "fbb/sla",
      element: (
        <AppRouteGuard>
          <FbbSlaPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useFbbRouter };
