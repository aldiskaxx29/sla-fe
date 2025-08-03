import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const ELibrary = lazy(() => import("@/modules/elibrary/pages/ELibraryPage"));
const useELibraryRouter = (): RouteObject[] => {
  return [
    {
      path: "elibrary",
      element: (
        <AppRouteGuard>
          <ELibrary />
        </AppRouteGuard>
      ),
    },
  ];
};

export { useELibraryRouter };
