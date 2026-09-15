import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { AppRouteGuard } from "@/app/components";

const InputSitePage = lazy(
  () => import("@/app/components/pages/InputSitePage"),
);

const useRekonsiliasiRouter = (): RouteObject[] => {
  return [
    {
      path: "input-site",
      element: (
        <AppRouteGuard>
          <InputSitePage />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useRekonsiliasiRouter };
