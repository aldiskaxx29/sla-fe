// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";
// UI
const Prediction = lazy(() => import("@/modules/vaccess/pages/access/Prediction"));

const useAccessPredictionRouter = (): RouteObject[] => {
  return [
    {
      path: "access-prediction",
      element: (
        <AppRouteGuard>
          <Prediction />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useAccessPredictionRouter };
