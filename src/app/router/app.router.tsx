// React Router DOM
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
