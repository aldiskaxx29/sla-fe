import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const Monday = lazy(() => import("@/modules/monday/pages/MondayPage"));
const useMondayRouter = (): RouteObject[] => {
  return [
    {
      path: "monday",
      element: (
        <AppRouteGuard>
          <Monday />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useMondayRouter };
