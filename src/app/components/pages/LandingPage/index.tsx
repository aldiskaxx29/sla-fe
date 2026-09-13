// React
import { useNavigate } from "react-router-dom";
import {
  LuBuilding2,
  LuChartColumn,
  LuNetwork,
  LuRouter,
} from "react-icons/lu";

// Templates
import LandingTemplate from "@/app/components/templates/LandingTemplate";

// Auth
import { getCnopRedirectPath } from "@/modules/auth/rtk/auth.rtk";

interface DashboardShortcut {
  key: string;
  label: string;
  icon: typeof LuChartColumn;
  /** Dihitung saat diklik karena tujuan CNOP tergantung hak akses user. */
  to: () => string;
}

const SHORTCUTS: DashboardShortcut[] = [
  {
    key: "cnop",
    label: "CNOP",
    icon: LuChartColumn,
    to: getCnopRedirectPath,
  },
  { key: "fbb", label: "FBB", icon: LuRouter, to: () => "/fbb/sla" },
  { key: "ebis", label: "EBIS", icon: LuBuilding2, to: () => "/ebis" },
  { key: "olo", label: "OLO", icon: LuNetwork, to: () => "/olo" },
];

/** Pemilih dashboard setelah login. */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <LandingTemplate>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <h1 className="text-[32px] leading-tight font-bold tracking-[-0.48px] text-[#050505]">
            Explore Dashboards
          </h1>
        </div>

        <p className="max-w-xl text-center text-sm text-[#636363]">
          Access CNOP, FBB, EBIS, and OLO dashboards from one streamlined
          workspace.
        </p>

        <nav className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-stone-500/10 p-4">
          {SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <button
                key={shortcut.key}
                type="button"
                onClick={() => navigate(shortcut.to())}
                className="flex w-[120px] cursor-pointer items-center gap-3 rounded-full border border-[#e6e5e3] bg-white p-3 transition-colors hover:bg-black/[0.02]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgba(10,18,31,0.08)] text-[#525252]">
                  <Icon size={16} />
                </span>
                <span className="text-lg font-semibold text-[#050505]">
                  {shortcut.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </LandingTemplate>
  );
};

export default LandingPage;
