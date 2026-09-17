import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const MsaPage = lazy(() => import("@/app/components/pages/MsaPage"));

const useMsaRouter = (): RouteObject[] => [
  {
    path: "msa",
    element: (
      <AppRouteGuard>
        <MsaPage />
      </AppRouteGuard>
    ),
  },
];

export { useMsaRouter };
