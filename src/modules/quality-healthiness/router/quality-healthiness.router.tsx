import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const QualityHealthinessPage = lazy(
  () => import("@/modules/quality-healthiness/pages/QualityHealthinessPage")
);
const useQualityHealthinessRouter = (): RouteObject[] => {
  return [
    {
      path: "quality-healthiness",
      element: (
        <AppRouteGuard>
          <QualityHealthinessPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useQualityHealthinessRouter };
