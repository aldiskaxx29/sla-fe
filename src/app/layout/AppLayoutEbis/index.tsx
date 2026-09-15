import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuTrendingUpDown } from "react-icons/lu";

import { AppRouteWrapper } from "@/app/components";

import DashboardShellTemplate from "@/app/components/templates/DashboardShellTemplate";

import type { DashboardSidebarMenu } from "@/app/components/organisms/navigation/DashboardSidebar";

const EBIS_MENUS: DashboardSidebarMenu[] = [
  {
    key: "kpi",
    label: "KPI Enterprise",
    path: "/ebis/kpi",
    icon: LuTrendingUpDown,
  },
];

const AppLayoutEbis = () => {
  const location = useLocation();

  const activeMenu = useMemo(
    () =>
      EBIS_MENUS.find((menu) => location.pathname.startsWith(menu.path)) ??
      EBIS_MENUS[0],
    [location.pathname],
  );

  return (
    <DashboardShellTemplate
      menus={EBIS_MENUS}
      activeKey={activeMenu.key}
      title="EBIS"
    >
      <AppRouteWrapper />
    </DashboardShellTemplate>
  );
};

AppLayoutEbis.displayName = "AppLayoutEbis";

export { AppLayoutEbis };
