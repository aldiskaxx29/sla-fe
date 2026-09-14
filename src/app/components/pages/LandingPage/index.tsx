import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowUpRight,
  LuBuilding2,
  LuChartColumn,
  LuNetwork,
  LuRouter,
  LuSearch,
} from "react-icons/lu";

import LandingTemplate from "@/app/components/templates/LandingTemplate";

import { getCnopRedirectPath } from "@/modules/auth/rtk/auth.rtk";

import qosmoIcon from "@/assets/qosmo-icon.png";

interface DashboardShortcut {
  key: string;
  label: string;
  description: string;
  icon: typeof LuChartColumn;
  titleClass: string;
  iconClass: string;
  to: () => string;
}

const SHORTCUTS: DashboardShortcut[] = [
  {
    key: "cnop",
    label: "CNOP Monitoring",
    description:
      "Track CNOP service quality, SLA performance, and corrective actions across regions.",
    icon: LuChartColumn,
    titleClass: "text-[#1d6fdc]",
    iconClass: "bg-[#e3edfb] text-[#1d6fdc]",
    to: getCnopRedirectPath,
  },
  {
    key: "fbb",
    label: "FBB Monitoring",
    description:
      "Review Fixed Broadband availability, experience signals, and operational issues.",
    icon: LuRouter,
    titleClass: "text-[#0f8a4f]",
    iconClass: "bg-[#dff3e8] text-[#0f8a4f]",
    to: () => "/fbb/sla",
  },
  {
    key: "ebis",
    label: "EBIS Monitoring",
    description:
      "Monitor enterprise service performance, trends, and site-level follow-up.",
    icon: LuBuilding2,
    titleClass: "text-[#9333ea]",
    iconClass: "bg-[#f1e6fd] text-[#9333ea]",
    to: () => "/ebis",
  },
  {
    key: "olo",
    label: "OLO Monitoring",
    description:
      "Assess OLO service quality, SLA achievement, and active issue status.",
    icon: LuNetwork,
    titleClass: "text-[#e2560d]",
    iconClass: "bg-[#fdebe1] text-[#e2560d]",
    to: () => "/olo",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const shortcuts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return SHORTCUTS;

    return SHORTCUTS.filter((shortcut) =>
      `${shortcut.label} ${shortcut.description}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [search]);

  return (
    <LandingTemplate>
      <div className="flex w-full max-w-[1152px] flex-col items-center">
        <h1 className="flex items-center gap-3 text-center text-[32px] leading-tight font-semibold tracking-[-0.48px] text-[#050505]">
          <img src={qosmoIcon} alt="" className="size-9 object-contain" />
          Welcome to Qosmo
          <span aria-hidden>👋</span>
        </h1>

        <p className="mt-4 max-w-xl text-center text-[15px] text-[#525252]">
          Access CNOP, FBB, EBIS, and OLO dashboards from one streamlined
          workspace.
        </p>

        <label className="mt-6 flex w-full max-w-[640px] items-center gap-3 rounded-full border border-[#e6e5e3] bg-white px-5 py-2.5 focus-within:border-slate-300">
          <LuSearch size={16} className="shrink-0 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dashboard"
            className="w-full bg-transparent text-sm text-[#050505] outline-none placeholder:text-[#636363]"
          />
        </label>

        <section className="mt-14 w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#050505]">
              Explore Monitoring Dashboards
            </h2>
            <span className="text-xs text-[#636363]">
              {shortcuts.length} Available Dashboards
            </span>
          </div>

          {shortcuts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;

                return (
                  <button
                    key={shortcut.key}
                    type="button"
                    onClick={() => navigate(shortcut.to())}
                    className="group flex cursor-pointer flex-col rounded-2xl border border-[#e6e5e3] bg-white p-4 text-left transition-shadow hover:shadow-[0px_8px_24px_rgba(2,6,23,0.08)]"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg ${shortcut.iconClass}`}
                      >
                        <Icon size={16} />
                      </span>
                      <LuArrowUpRight
                        size={16}
                        className="text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>

                    <span
                      className={`mt-4 text-lg font-semibold ${shortcut.titleClass}`}
                    >
                      {shortcut.label}
                    </span>
                    <span className="mt-1.5 text-[13px] leading-[18px] text-[#525252]">
                      {shortcut.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#e6e5e3] bg-white py-10 text-center text-sm text-[#636363]">
              Dashboard tidak ditemukan.
            </p>
          )}
        </section>
      </div>
    </LandingTemplate>
  );
};

export default LandingPage;
