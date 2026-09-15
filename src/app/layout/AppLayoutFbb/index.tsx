// React
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuRadio, LuRouter, LuTrendingUpDown } from "react-icons/lu";

// Components
import { AppRouteWrapper } from "@/app/components";

// Templates
import DashboardShellTemplate from "@/app/components/templates/DashboardShellTemplate";

// Organism
import type { DashboardSidebarMenu } from "@/app/components/organisms/navigation/DashboardSidebar";

const FBB_MENUS: DashboardSidebarMenu[] = [
  { key: "sla", label: "SLA WISA FBB", path: "/fbb/sla", icon: LuTrendingUpDown },
  { key: "onx", label: "ONX Dashboard", path: "/fbb/onx", icon: LuRouter },
  { key: "ookla", label: "Ookla Dashboard", path: "/fbb/ookla", icon: LuRadio },
];

/** Shell dashboard FBB: sidebar menu FBB dan bar judul halaman. */
const AppLayoutFbb = () => {
  const location = useLocation();

  const activeMenu = useMemo(
    () =>
      FBB_MENUS.find((menu) => location.pathname.startsWith(menu.path)) ??
      FBB_MENUS[0],
    [location.pathname],
  );

  return (
    <DashboardShellTemplate menus={FBB_MENUS} activeKey={activeMenu.key} title={activeMenu.label}>
      <AppRouteWrapper />
    </DashboardShellTemplate>
  );
};

AppLayoutFbb.displayName = "AppLayoutFbb";

export { AppLayoutFbb };
