import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const Network = lazy(() => import("@/modules/network/pages/NetworkPage"));
const useNetworkRouter = (): RouteObject[] => {
  return [
    {
      path: "network/:menuId",
      element: (
        <AppRouteGuard>
          <Network />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useNetworkRouter };
