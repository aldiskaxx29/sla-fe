import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuLayoutDashboard,
} from "react-icons/lu";

import { LANDING_PATH } from "@/app/config/auth.config";

export interface DashboardSidebarMenu {
  key: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}

interface DashboardSidebarProps {
  menus?: DashboardSidebarMenu[];
  activeKey?: string;
}

const ACTIVE_ITEM =
  "border-[3px] border-transparent text-white shadow-[0px_4px_10px_0px_rgba(11,87,208,0.35)] [background-origin:border-box] [background-clip:padding-box,border-box] [background-image:linear-gradient(180deg,#86b4ff_0%,#0661f7_100%),linear-gradient(180deg,#cee1ff_0%,rgba(11,87,208,0)_46.777%,#cee1ff_100%)]";

const ACTIVE_ICON =
  "bg-[linear-gradient(180deg,#86b4ff_0%,#0661f7_100%)] text-white shadow-[0px_4px_10px_0px_rgba(11,87,208,0.35)]";

function SidebarTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 rounded-md bg-[#0f172a] px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] transition-opacity duration-150 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

export function DashboardSidebar({
  menus = [],
  activeKey,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const backToLanding = (
    <button
      type="button"
      onClick={() => navigate(LANDING_PATH)}
      aria-label="Back to landing page"
      className={`group relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-[#334155] transition-colors hover:bg-[#f8fafc] ${
        open ? "" : ""
      }`}
    >
      <LuLayoutDashboard className="size-4" />
      {!open && <SidebarTooltip label="Back to landing page" />}
    </button>
  );

  return (
    <aside
      className={`flex shrink-0 flex-col items-center justify-between rounded-tr-[33px] border-r border-[#e2e8f0] bg-white pb-[48px] transition-[width] duration-300 ease-in-out ${
        open ? "w-[208px] overflow-hidden" : "w-[60px]"
      }`}
    >
      <div className="flex w-full flex-col items-center">
        <div
          className={`flex w-full items-center border-b border-[#e2e8f0] p-4 ${
            open ? "justify-end" : "justify-center"
          }`}
        >
          <button
            type="button"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setOpen((current) => !current)}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#334155] transition-colors hover:bg-[#eef2f6]"
          >
            {open ? (
              <LuChevronLeft className="size-4" />
            ) : (
              <LuChevronRight className="size-4" />
            )}
          </button>
        </div>

        <div className="flex w-full flex-col gap-5 p-4">
          <div
            className={`flex w-full flex-col gap-4 ${
              open ? "items-start" : "items-center"
            }`}
          >
            {backToLanding}

            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = menu.key === activeKey;

              return (
                <button
                  key={menu.key}
                  type="button"
                  onClick={() => navigate(menu.path)}
                  aria-label={menu.label}
                  className={
                    open
                      ? `flex w-full cursor-pointer items-center gap-3 rounded-[14px] p-2 transition-colors ${
                          active ? ACTIVE_ITEM : "text-[#334155] hover:bg-[#f8fafc]"
                        }`
                      : `group relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                          active
                            ? ACTIVE_ICON
                            : "bg-white text-[#334155] hover:bg-[#f8fafc]"
                        }`
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {open ? (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {menu.label}
                    </span>
                  ) : (
                    <SidebarTooltip label={menu.label} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
