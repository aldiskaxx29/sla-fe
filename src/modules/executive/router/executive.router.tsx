import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const Executive = lazy(() => import("@/modules/executive/pages/ExecutivePage"));
const useExecutiveRouter = (): RouteObject[] => {
  return [
    {
      path: "executive",
      element: (
        <AppRouteGuard>
          <Executive />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useExecutiveRouter };
