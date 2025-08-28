// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const UserPage = lazy(() => import("@/modules/user/pages/UserPage"));

const useUserRouter = (): RouteObject[] => {
  return [
    {
      path: "user",
      element: (
        <AppRouteGuard>
          <UserPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useUserRouter };
