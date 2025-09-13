import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const Profile = lazy(() => import("@/modules/profile/pages/ProfilePage"));
const useProfileRouter = (): RouteObject[] => {
  return [
    {
      path: "profile",
      element: (
        <AppRouteGuard>
          <Profile />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useProfileRouter };
