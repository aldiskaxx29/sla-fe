// React Router DOM
import { useRoutes } from "react-router-dom";

// UI
// import { AppNotFound } from "@/modules/app/ui";

// Components
// import { AppLayoutBackOffice } from "@/app/components";

// Layouts
import { AppLayoutEmpty, AppLayoutAuth, AppLayoutDefault } from "@/app/layout";

// Routes General
import { useAppRouter } from "@/app/router/app.router";

// Routes Auth
import { useAuthRouter } from "@/modules/auth/router/auth.router";

// Routes Back Office
import { useDashboardRouter } from "@/modules/dashboard/router/dashboard.router";
import { useSiteRouter } from "@/modules/site/router/site.router";
import { useMondayRouter } from "@/modules/monday/router/monday.router";
import { useQualityHealthinessRouter } from "@/modules/quality-healthiness/router/quality-healthiness.router";
import { useOneRouter } from "@/modules/one/router/one.router";
import { useExecutiveRouter } from "@/modules/executive/router/executive.router";
import { useELibraryRouter } from "@/modules/elibrary/router/elibrary.router";
import { useNetworkRouter } from "@/modules/network/router/network.router";
import { useTicketRouter } from "@/modules/ticket/router/ticket.router";

const useRouter = () => {
  // Router
  const app = useAppRouter();
  const auth = useAuthRouter();
  const dashboard = useDashboardRouter();
  const site = useSiteRouter();
  const monday = useMondayRouter();
  const qualityHealthiness = useQualityHealthinessRouter();
  const executive = useExecutiveRouter();
  const elibrary = useELibraryRouter();
  const network = useNetworkRouter();
  const one = useOneRouter();
  const ticket = useTicketRouter();

  const routes = useRoutes([
    ...app,
    {
      path: "auth",
      element: <AppLayoutAuth />,
      children: [...auth],
    },
    {
      path: "back-office",
      element: <AppLayoutDefault />,
      children: [
        ...dashboard,
        ...qualityHealthiness,
        ...site,
        ...monday,
        ...one,
        ...executive,
        ...elibrary,
        ...network,
        ...ticket
      ],
    },
    {
      path: "*",
      element: <AppLayoutEmpty />,
      children: [
        {
          path: "*",
          // element: <AppNotFound />,
        },
      ],
    },
  ]);

  return routes;
};

export { useRouter };
