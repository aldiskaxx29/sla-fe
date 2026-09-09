// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
const MondayPage = lazy(() => import("@/app/components/pages/MondayPage"));

/** Rute Monday Monitoring, sudah lepas dari folder `modules`. */
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
