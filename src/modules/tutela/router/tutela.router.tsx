import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const Tutela = lazy(() => import("@/modules/tutela/pages/TutelaPage"));

const useTutelaRouter = (): RouteObject[] => {
  return [
    {
      path: "tutela",
      element: (
        <AppRouteGuard>
          <Tutela />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useTutelaRouter };
