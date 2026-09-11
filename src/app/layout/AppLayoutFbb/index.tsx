// React
import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LuActivity, LuRadio, LuRouter } from "react-icons/lu";

// Components
import { AppRouteWrapper } from "@/app/components";

// Layout
import AppShell, { type AppShellMenu } from "@/app/layout/AppShell";

// Context
import { FbbShellContext } from "@/app/layout/AppLayoutFbb/context";

const FBB_MENUS: AppShellMenu[] = [
  { path: "/fbb/sla", label: "SLA WISA FBB", icon: LuActivity },
  { path: "/fbb/onx", label: "ONX Dashboard", icon: LuRouter },
  { path: "/fbb/ookla", label: "Ookla Dashboard", icon: LuRadio },
];

/** Shell dashboard FBB: sidebar menu FBB dan header judul halaman. */
const AppLayoutFbb = () => {
  const location = useLocation();
  const [badge, setBadge] = useState<ReactNode>(null);

  const activeMenu = useMemo(
    () =>
      FBB_MENUS.find((menu) => location.pathname.startsWith(menu.path)) ??
      FBB_MENUS[0],
    [location.pathname],
  );

  const shell = useMemo(() => ({ setBadge }), []);

  return (
    <FbbShellContext.Provider value={shell}>
      <AppShell menus={FBB_MENUS} title={activeMenu.label} badge={badge}>
        <AppRouteWrapper />
      </AppShell>
    </FbbShellContext.Provider>
  );
};

AppLayoutFbb.displayName = "AppLayoutFbb";

export { AppLayoutFbb };
