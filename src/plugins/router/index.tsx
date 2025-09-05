import { useRoutes } from "react-router-dom";

import { AppLayoutEmpty, AppLayoutAuth, AppLayoutDefault } from "@/app/layout";
import { useAppRouter } from "@/app/router/app.router";
import { useAuthRouter } from "@/modules/auth/router/auth.router";
import { useDashboardRouter } from "@/modules/dashboard/router/dashboard.router";
import { useSiteRouter } from "@/modules/site/router/site.router";
import { useMondayRouter } from "@/modules/monday/router/monday.router";
// import { useQualityHealthinessRouter } from "@/modules/quality-healthiness/router/quality-healthiness.router";
import { useOneRouter } from "@/modules/one/router/one.router";
import { useExecutiveRouter } from "@/modules/executive/router/executive.router";
import { useELibraryRouter } from "@/modules/elibrary/router/elibrary.router";
import { useNetworkRouter } from "@/modules/network/router/network.router";
import { useTicketRouter } from "@/modules/ticket/router/ticket.router";
import { AuthRouteGuard } from "../hooks/AuthenticationGuard";
import { useDashboardTARouter } from "@/modules/dashboard-ta/router/dashboardTA.router";
import { useUserRouter } from "@/modules/user/router/user.router";
import { useApproverRouter } from "@/modules/approver/router/approver.router";

const useRouter = () => {
  const app = useAppRouter();
  const auth = useAuthRouter();
  const dashboard = useDashboardRouter();
  const site = useSiteRouter();
  const monday = useMondayRouter();
  // const qualityHealthiness = useQualityHealthinessRouter();
  const executive = useExecutiveRouter();
  const elibrary = useELibraryRouter();
  const network = useNetworkRouter();
  const one = useOneRouter();
  const ticket = useTicketRouter();
  const dashboardTA = useDashboardTARouter();
  const user = useUserRouter();
  const approver = useApproverRouter();

  const routes = useRoutes([
    ...app,
    {
      path: "",
      element: <AuthRouteGuard requireAuth={false} />,
      children: [
        {
          path: "",
          element: <AppLayoutAuth />,
          children: [...auth],
        },
      ],
    },
    {
      path: "",
      element: <AuthRouteGuard />,
      children: [
        {
          path: "",
          element: <AppLayoutDefault />,
          children: [
            ...dashboard,
            // ...qualityHealthiness,
            ...site,
            ...monday,
            ...one,
            ...executive,
            ...elibrary,
            ...network,
            ...ticket,
            ...dashboardTA,
            ...user,
            ...approver,
          ],
        },
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
