import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { AppRouteGuard } from "@/app/components";

const ResumeRcaPage = lazy(
  () => import("@/app/components/pages/ResumeRcaPage"),
);

const useResumeRcaRouter = (): RouteObject[] => {
  return [
    {
      path: "resume-rca",
      element: (
        <AppRouteGuard>
          <ResumeRcaPage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useResumeRcaRouter };
