import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const One = lazy(() => import("@/modules/one/pages/OnePage"));
const useOneRouter = (): RouteObject[] => {
  return [
    {
      path: "one",
      element: (
        <AppRouteGuard>
          <One />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useOneRouter };
