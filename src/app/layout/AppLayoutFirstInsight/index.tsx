// React
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuRadioTower } from "react-icons/lu";

// Components
import { AppRouteWrapper } from "@/app/components";

// Layout
import AppShell from "@/app/layout/AppShell";

// Organism
import type { DashboardSidebarMenu } from "@/app/components/organism/navigation/DashboardSidebar";

const FIRST_INSIGHT_MENUS: DashboardSidebarMenu[] = [
  {
    key: "history-sla",
    label: "History SLA",
    path: "/first-insight/history-sla",
    icon: LuRadioTower,
  },
];

const AppLayoutFirstInsight = () => {
  const location = useLocation();

  const activeMenu = useMemo(
    () =>
      FIRST_INSIGHT_MENUS.find((menu) =>
        location.pathname.startsWith(menu.path),
      ) ?? FIRST_INSIGHT_MENUS[0],
    [location.pathname],
  );

  return (
    <AppShell
      menus={FIRST_INSIGHT_MENUS}
      activeKey={activeMenu.key}
      title={activeMenu.label}
    >
      <AppRouteWrapper />
    </AppShell>
  );
};

AppLayoutFirstInsight.displayName = "AppLayoutFirstInsight";

export { AppLayoutFirstInsight };
