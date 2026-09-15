import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";

const MondayPage = lazy(() => import("@/app/components/pages/MondayPage"));

const useMondayRouter = (): RouteObject[] => {
  return [
    {
      path: "monday",
      element: (
        <AppRouteGuard>
          <MondayPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useMondayRouter };
