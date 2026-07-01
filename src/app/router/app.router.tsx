// React Router DOM
import { Navigate } from "react-router-dom";
import {
  getPostLoginRedirectPath,
  isAuthenticated,
} from "@/modules/auth/rtk/auth.rtk";
import { RouteObject } from "react-router-dom";

// Components
import { AppLayoutEmpty } from "@/app/layout";

const useAppRouter = (): RouteObject[] => {
  return [
    {
      path: "/",
      element: <AppLayoutEmpty />,
      children: [
        {
          index: true,
          element: (
            <Navigate
              to={isAuthenticated() ? getPostLoginRedirectPath() : "/login"}
              replace
            />
          ),
        },
        {
          path: "executive",
          element: (
            <Navigate
              to={isAuthenticated() ? getPostLoginRedirectPath() : "/login"}
              replace
            />
          ),
        },
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
