import { useRoutes } from "react-router-dom";

import {
  AppLayoutEbis,
  AppLayoutEmpty,
  AppLayoutAuth,
  AppLayoutDefault,
  AppLayoutFbb,
  AppLayoutFirstInsight,
  AppLayoutProfile,
} from "@/app/layout";
import { useAppRouter } from "@/app/router/app.router";
import { useRekonsiliasiRouter } from "@/app/router/rekonsiliasi.router";
import { useAuthConfirmRouter, useAuthRouter } from "@/app/router/auth.router";
import { useDashboardRouter } from "@/modules/dashboard/router/dashboard.router";
import { useSiteRouter } from "@/modules/site/router/site.router";
import { useMondayRouter } from "@/app/router/monday.router";
import { useFbbRouter } from "@/app/router/fbb.router";
import { useFirstInsightRouter } from "@/app/router/first-insight.router";
import { useNetworkPerformanceRouter } from "@/app/router/network.router";
import { useEbisRouter } from "@/app/router/ebis.router";
import { useLandingRouter } from "@/app/router/landing.router";
import { useDailyMonitoringRouter } from "@/modules/daily-monitoring/router/dailyMonitoring.router";
// import { useQualityHealthinessRouter } from "@/modules/quality-healthiness/router/quality-healthiness.router";
import { useOneRouter } from "@/modules/one/router/one.router";
import { useELibraryRouter } from "@/modules/elibrary/router/elibrary.router";
import { useNetworkRouter } from "@/modules/network/router/network.router";
import { useTicketRouter } from "@/modules/ticket/router/ticket.router";
import { AuthRouteGuard } from "../hooks/AuthenticationGuard";
import { useDashboardTARouter } from "@/modules/dashboard-ta/router/dashboardTA.router";
import { useUserRouter } from "@/modules/user/router/user.router";
import { useApproverRouter } from "@/modules/approver/router/approver.router";
import { useProfileRouter } from "@/modules/profile/router/profile.router";
import { useAccessPredictionRouter } from "@/modules/vaccess/router/prediction.router";
import { useResumeRCARouter } from "@/modules/vaccess/router/resumerca.router";
import { useTutelaRouter } from "@/modules/tutela/router/tutela.router";

const useRouter = () => {
  const app = useAppRouter();
  const auth = useAuthRouter();
  const authConfirm = useAuthConfirmRouter();
  const dashboard = useDashboardRouter();
  const site = useSiteRouter();
  const rekonsiliasi = useRekonsiliasiRouter();
  const monday = useMondayRouter();
  const fbb = useFbbRouter();
  const firstInsight = useFirstInsightRouter();
  const networkPerformance = useNetworkPerformanceRouter();
  const ebis = useEbisRouter();
  const landing = useLandingRouter();
  const dailyMonitoring = useDailyMonitoringRouter();
  // const qualityHealthiness = useQualityHealthinessRouter();
  const elibrary = useELibraryRouter();
  const network = useNetworkRouter();
  const one = useOneRouter();
  const ticket = useTicketRouter();
  const dashboardTA = useDashboardTARouter();
  const user = useUserRouter();
  const approver = useApproverRouter();
  const profile = useProfileRouter();
  const acessprediction = useAccessPredictionRouter();
  const resumerca = useResumeRCARouter();
  const tutela = useTutelaRouter();

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
      element: <AuthRouteGuard  requireAuth={true}/>,
      children: [
        {
          path: "",
          element: <AppLayoutAuth />,
          children: [...authConfirm],
        },
        {
          // Landing dan dashboard "coming soon" tidak memakai header CNOP.
          path: "",
          element: <AppLayoutEmpty />,
          children: [...landing],
        },
        {
          // FBB punya shell sendiri: sidebar menu FBB + header judul halaman.
          path: "",
          element: <AppLayoutFbb />,
          children: [...fbb],
        },
        {
          path: "",
          element: <AppLayoutFirstInsight />,
          children: [...firstInsight],
        },
        {
          // EBIS memakai shell yang sama dengan FBB, menunya KPI Enterprise.
          path: "",
          element: <AppLayoutEbis />,
          children: [...ebis],
        },
        {
          // Profil tidak butuh menu CNOP, cukup tombol kembali ke landing.
          path: "",
          element: <AppLayoutProfile />,
          children: [...profile],
        },
        {
          path: "",
          element: <AppLayoutDefault />,
          children: [
            ...tutela,
            ...dashboard,
            // ...qualityHealthiness,
            ...site,
            ...rekonsiliasi,
            ...monday,
            ...dailyMonitoring,
            ...one,
            ...elibrary,
            ...networkPerformance,
            ...network,
            ...ticket,
            ...dashboardTA,
            ...user,
            ...approver,
            ...acessprediction,
            ...resumerca,
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
