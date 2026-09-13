// React
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuTrendingUpDown } from "react-icons/lu";

// Components
import { AppRouteWrapper } from "@/app/components";

// Layout
import AppShell from "@/app/layout/AppShell";

// Organism
import type { DashboardSidebarMenu } from "@/app/components/organism/navigation/DashboardSidebar";

const EBIS_MENUS: DashboardSidebarMenu[] = [
  {
    key: "kpi",
    label: "KPI Enterprise",
    path: "/ebis/kpi",
    icon: LuTrendingUpDown,
  },
];

/** Shell dashboard EBIS; menunya baru KPI Enterprise. */
const AppLayoutEbis = () => {
  const location = useLocation();

  const activeMenu = useMemo(
    () =>
      EBIS_MENUS.find((menu) => location.pathname.startsWith(menu.path)) ??
      EBIS_MENUS[0],
    [location.pathname],
  );

  return (
    <AppShell
      menus={EBIS_MENUS}
      activeKey={activeMenu.key}
      title={activeMenu.label}
    >
      <AppRouteWrapper />
    </AppShell>
  );
};

AppLayoutEbis.displayName = "AppLayoutEbis";

export { AppLayoutEbis };
