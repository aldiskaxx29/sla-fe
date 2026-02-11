// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// UI
const ApproverPage = lazy(
  () => import("@/modules/approver/pages/ApproverPage")
);

const useApproverRouter = (): RouteObject[] => {
  return [
    {
      path: "approver",
      element: (
        <AppRouteGuard>
          <ApproverPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useApproverRouter };
