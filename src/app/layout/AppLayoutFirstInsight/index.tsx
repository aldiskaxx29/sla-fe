// React
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuRadioTower } from "react-icons/lu";

// Components
import { AppRouteWrapper } from "@/app/components";

// Templates
import DashboardShellTemplate from "@/app/components/templates/DashboardShellTemplate";

// Organism
import type { DashboardSidebarMenu } from "@/app/components/organisms/navigation/DashboardSidebar";

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
    <DashboardShellTemplate
      menus={FIRST_INSIGHT_MENUS}
      activeKey={activeMenu.key}
      title={activeMenu.label}
    >
      <AppRouteWrapper />
    </DashboardShellTemplate>
  );
};

AppLayoutFirstInsight.displayName = "AppLayoutFirstInsight";

export { AppLayoutFirstInsight };
