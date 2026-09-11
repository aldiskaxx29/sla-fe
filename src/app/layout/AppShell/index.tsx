// React
import { useState, type ComponentType, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuLayoutGrid, LuPanelLeft } from "react-icons/lu";

// Molecules
import { UserMenu } from "@/app/components/molecules/UserMenu";

// Auth
import { LANDING_PATH } from "@/modules/auth/rtk/auth.rtk";

export interface AppShellMenu {
  path: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface AppShellProps {
  /** Kosongkan kalau halamannya berdiri sendiri, mis. profil. */
  menus?: AppShellMenu[];
  title: string;
  /** Keterangan kecil di samping judul, mis. periode data. */
  badge?: ReactNode;
  children: ReactNode;
}

/**
 * Kerangka dashboard di luar CNOP: sidebar ramping berisi tombol kembali ke
 * landing (plus menu bila ada) dan header berisi judul halaman.
 */
const AppShell = ({ menus = [], title, badge, children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const activePath = menus.find((menu) =>
    location.pathname.startsWith(menu.path),
  )?.path;

  return (
    <div className="flex min-h-screen bg-white">
      <aside
        className={`flex shrink-0 flex-col gap-4 border-r border-slate-200 bg-[#FAFAFA] py-4 transition-all ${
          collapsed || !menus.length ? "w-16 px-2" : "w-60 px-3"
        }`}
      >
        {/* Label hanya muncul saat hover, jadi sidebar tetap ringkas. */}
        <div className="group relative w-fit">
          <button
            type="button"
            onClick={() => navigate(LANDING_PATH)}
            aria-label="Back to landing page"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-navy"
          >
            <LuLayoutGrid size={17} />
          </button>

          <span
            role="tooltip"
            className="pointer-events-none absolute top-1/2 left-full z-30 ml-2 -translate-y-1/2 rounded-lg bg-navy px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          >
            Back to landing page
          </span>
        </div>

        {menus.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-[#007BFF] transition-colors hover:bg-white"
            >
              <LuPanelLeft size={16} />
            </button>

            <nav className="flex flex-col gap-1.5">
              {menus.map((menu) => {
                const Icon = menu.icon;
                const active = menu.path === activePath;

                return (
                  <button
                    key={menu.path}
                    type="button"
                    onClick={() => navigate(menu.path)}
                    title={menu.label}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                      active
                        ? "bg-slate-200/70 text-navy"
                        : "text-slate-500 hover:bg-slate-200/40 hover:text-navy"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{menu.label}</span>}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-navy">
              {title}
            </h1>
            {badge ? (
              <span className="truncate rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-500">
                {badge}
              </span>
            ) : null}
          </div>

          <div className="shrink-0">
            <UserMenu />
          </div>
        </header>

        <div className="min-w-0 flex-1 bg-[#FAFAFA]">{children}</div>
      </div>
    </div>
  );
};

export default AppShell;
