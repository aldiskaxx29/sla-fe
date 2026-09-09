// React
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

// Pages
const InputSitePage = lazy(
  () => import("@/app/components/pages/InputSitePage"),
);

/** Rute halaman rekonsiliasi, sudah lepas dari folder `modules`. */
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
