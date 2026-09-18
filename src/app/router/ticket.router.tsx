import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const TicketQualityPage = lazy(
  () => import("@/app/components/pages/TicketQualityPage"),
);

const useTicketQualityRouter = (): RouteObject[] => [
  { path: "ticket", element: <Navigate to="/ticket/quality" replace /> },
  {
    path: "ticket/quality",
    element: (
      <AppRouteGuard>
        <TicketQualityPage />
      </AppRouteGuard>
    ),
  },
];

export { useTicketQualityRouter };
