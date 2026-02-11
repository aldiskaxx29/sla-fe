import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const Ticket = lazy(() => import("@/modules/ticket/pages/TicketPage"));
const useTicketRouter = (): RouteObject[] => {
  return [
    {
      path: "ticket",
      element: (
        <AppRouteGuard>
          <Ticket />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useTicketRouter };
