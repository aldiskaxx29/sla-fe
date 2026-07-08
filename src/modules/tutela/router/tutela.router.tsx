import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const TutelaLayout = lazy(() => import("@/modules/tutela/pages/TutelaLayout"));
const Tutela = lazy(() => import("@/modules/tutela/pages/TutelaPage"));
const MobileExperience = lazy(() => import("@/modules/tutela/pages/MobileExperiencePage"));
const IspProvider = lazy(() => import("@/modules/tutela/pages/IspProviderPage"));

const useTutelaRouter = (): RouteObject[] => {
  return [
    {
      path: "onx",
      element: (
        <AppRouteGuard>
          <TutelaLayout />
        </AppRouteGuard>
      ),
      children: [
        {
          index: true,
          element: <Tutela />,
        },
        {
          path: "mobile-experience",
          element: <MobileExperience />,
        },
        {
          path: "isp-provider",
          element: <IspProvider />,
        },
      ],
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
