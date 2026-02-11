// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";
// UI
const ResumeRCA = lazy(() => import("@/modules/vaccess/pages/rca/ResumeRCA"));

const useResumeRCARouter = (): RouteObject[] => {
  return [
    {
      path: "resume-rca",
      element: (
        <AppRouteGuard>
          <ResumeRCA/>
        </AppRouteGuard>
      ),
    },
  ];
};

export { useResumeRCARouter };
