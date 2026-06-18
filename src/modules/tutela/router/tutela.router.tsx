import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const Tutela = lazy(() => import("@/modules/tutela/pages/TutelaPage"));

const useTutelaRouter = (): RouteObject[] => {
  return [
    {
      path: "onx",
      element: (
        <AppRouteGuard>
          <Tutela />
        </AppRouteGuard>
      ),
    },
    {
      path: "onx/*",
      element: <Navigate to="/onx" replace />,
    },
    {
      path: "tutela",
      element: <Navigate to="/onx" replace />,
    },
  ];
};

export { useTutelaRouter };
