// React Lazily
import { lazy } from "react";

// React Router DOM
import { RouteObject } from "react-router-dom";

// Components
import { AppRouteGuard } from "@/app/components";

const AppEntryPoint = lazy(() => import("@/app/ui/AppEntryPoint"));

import { AppLayoutDefault, AppLayoutEmpty } from "@/app/layout";

const useAppRouter = (): RouteObject[] => {
  return [
    {
      path: "",
      element: <AppLayoutDefault />,
      children: [
        {
          path: "",
          element: (
            <AppRouteGuard>
              <AppEntryPoint />
            </AppRouteGuard>
          ),
        },
      ],
    },
    {
      path: "/",
      element: <AppLayoutEmpty />,
      children: [
        {
          path: "access-denied",
          // element: <AppAccessDenied />,
        },
        {
          path: "no-connection",
          // element: <AppNoConnection />,
        },
      ],
    },
  ];
};

export { useAppRouter };
