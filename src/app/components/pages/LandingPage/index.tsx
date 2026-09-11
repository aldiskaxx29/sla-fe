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
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Explore Dashboards
          </h1>
        </div>

        <p className="max-w-xl text-sm text-slate-500">
          Akses dashboard CNOP, FBB, EBIS, dan OLO dari satu tempat.
        </p>

        <nav className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-stone-500/10 p-4">
          {SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <button
                key={shortcut.key}
                type="button"
                onClick={() => navigate(shortcut.to())}
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2.5 pl-2.5 pr-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Icon size={17} />
                </span>
                <span className="text-base font-extrabold text-navy">
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
