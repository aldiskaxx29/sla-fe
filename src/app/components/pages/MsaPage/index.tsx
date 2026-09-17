import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  useMsaAchievementQuery,
  useMsaComplyQuery,
  useMsaHistoryQuery,
  useMsaRealisasiQuery,
  useMsaSiteWeekQuery,
  useMsaTrendQueries,
  useMsaWeeklyDetailQuery,
} from "@/app/hooks";
import { useMsaRowExpansion } from "@/app/hooks/custom/useMsaRowExpansion";
import { useMsaHistoryExpansion } from "@/app/hooks/custom/useMsaHistoryExpansion";

import { Skeleton } from "@/app/components/atoms";

import FilterDropdown from "@/app/components/molecules/FilterDropdown";

import { MsaTrendChart } from "@/app/components/organisms/charts/MsaTrendChart";
import { MsaToolbar } from "@/app/components/organisms/forms/MsaToolbar";
import { MsaPredictionPanel } from "@/app/components/organisms/panels/MsaPredictionPanel";
import { MsaRealisasiModal } from "@/app/components/organisms/popup/MsaRealisasiModal";
import { MsaSiteWeekModal } from "@/app/components/organisms/popup/MsaSiteWeekModal";
import { MsaWeeklyDetailModal } from "@/app/components/organisms/popup/MsaWeeklyDetailModal";
import { MsaAchievementTable } from "@/app/components/organisms/tables/MsaAchievementTable";
import { MsaHistoryTable } from "@/app/components/organisms/tables/MsaHistoryTable";
import { MsaHistoryWeeklyTable } from "@/app/components/organisms/tables/MsaHistoryWeeklyTable";
import MsaTemplate, {
  MsaSection,
} from "@/app/components/templates/MsaTemplate";

import type {
  MsaLevel,
  MsaRow,
  MsaSiteWeekParams,
  MsaSlaMode,
  MsaWeeklyDetailParams,
} from "@/app/types/msa/msa.types";
import {
  formatWeeklyKpiLabel,
  mapKpiToSiteTypeCode,
  WEEKLY_KPI_OPTIONS,
} from "@/app/utils/msa.utils";
import { downloadMsaReport } from "@/app/utils/msaExport.utils";
import { findActualWeekNumber } from "@/app/utils/msaColumns.utils";

const TREND_CHARTS: Array<{
  parameter: string;
  title: string;
  description: string;
}> = [
  {
    parameter: "packetloss ran to core",
    title: "PACKETLOSS RAN-TO-CORE",
    description: "Lower Better",
  },
  {
    parameter: "packetloss core to internet",
    title: "PACKETLOSS CORE-TO-INTERNET",
    description: "Higher Better",
  },
  {
    parameter: "latency ran to core",
    title: "LATENCY RAN-TO-CORE",
    description: "Higher Better",
  },
  {
    parameter: "latency core to internet",
    title: "LATENCY CORE-TO-INTERNET",
    description: "Higher Better",
  },
  {
    parameter: "jitter ran to core",
    title: "JITTER RAN-TO-CORE",
    description: "Higher Better",
  },
  {
    parameter: "jitter core to internet",
    title: "JITTER CORE-TO-INTERNET",
    description: "Higher Better",
  },
  {
    parameter: "mttrq ran to core major",
    title: "MTTRQ MAJOR",
    description: "Higher Better",
  },
  {
    parameter: "mttrq ran to core minor",
    title: "MTTRQ MINOR",
    description: "Higher Better",
  },
];

const LEVEL_OPTIONS: Array<{ value: MsaLevel; label: string }> = [
  { value: "nation", label: "Nation Wide" },
  { value: "area", label: "Area" },
  { value: "region", label: "Regional" },
];

const DEFAULT_HISTORY_KPI = "pl 5% ran to core";
const DEFAULT_WEEKLY_KPI = "packetloss 1-5% ran to core";

const parameterOf = (row: MsaRow) =>
  String(row.mini_parameter ?? row.parameter ?? "");

const MsaPage = () => {
  const [treg, setTreg] = useState("all");
  const [filter, setFilter] = useState("by ach");
  const [showActualWeeks, setShowActualWeeks] = useState(false);
  const [level, setLevel] = useState<MsaLevel>("nation");
  const [slaMode, setSlaMode] = useState<MsaSlaMode>("monthly");
  const [weeklyKpi, setWeeklyKpi] = useState(DEFAULT_WEEKLY_KPI);
  const [exporting, setExporting] = useState(false);

  const [weeklyDetail, setWeeklyDetail] =
    useState<MsaWeeklyDetailParams | null>(null);
  const [realisasi, setRealisasi] = useState<{
    kpi: string;
    monthNum: number;
    year: number;
  } | null>(null);
  const [siteWeek, setSiteWeek] = useState<MsaSiteWeekParams | null>(null);

  const achievement = useMsaAchievementQuery({ treg });
  const comply = useMsaComplyQuery();
  const trend = useMsaTrendQueries({ level, treg });

  const history = useMsaHistoryQuery(
    slaMode === "weekly"
      ? { kpi: weeklyKpi, treg, rekon: "before", type: "cnop" }
      : { kpi: DEFAULT_HISTORY_KPI, treg, filter },
  );

  const achievementRows = useMemo(
    () => achievement.data ?? [],
    [achievement.data],
  );

  const achievementExpansion = useMsaRowExpansion({ treg });
  const historyExpansion = useMsaHistoryExpansion(treg, filter);

  const weeklyDetailQuery = useMsaWeeklyDetailQuery(weeklyDetail);
  const realisasiQuery = useMsaRealisasiQuery(realisasi);
  const siteWeekQuery = useMsaSiteWeekQuery(siteWeek);

  const handleTregChange = (value: string) => {
    setTreg(value);
    achievementExpansion.reset();
    historyExpansion.reset();
  };

  /** Ganti "Filter By" memuat ulang data, jadi baris yang terbuka direset. */
  const handleFilterChange = (value: string) => {
    setFilter(value);
    achievementExpansion.reset();
    historyExpansion.reset();
  };

  const handleExport = async () => {
    // Server butuh beberapa detik menyiapkan file, jadi tombolnya dikunci dulu.
    setExporting(true);

    try {
      const downloaded = await downloadMsaReport();

      if (!downloaded) {
        toast.info("Unduhan Report PQM dilanjutkan lewat tab browser.");
      }
    } finally {
      setExporting(false);
    }
  };

  const handleWeekClick = (
    row: MsaRow,
    column: { monthNum: number; weekNum?: number },
  ) => {
    if (!column.weekNum) return;

    const isParent = Boolean(row.main_parent);

    setWeeklyDetail({
      week: `week_${column.monthNum}_${column.weekNum}`,
      year: Number(row.year) || new Date().getFullYear(),
      kpi: (isParent
        ? String(row.parameter ?? "")
        : String(row.mini_parameter ?? "")
      ).toLowerCase(),
      region: isParent ? "" : String(row.parameter ?? "").toLowerCase(),
    });
  };

  const handleRealisasiClick = (row: MsaRow, monthNum: number) => {
    setRealisasi({
      kpi: parameterOf(row).toLowerCase(),
      monthNum,
      year: Number(row.year) || new Date().getFullYear(),
    });
  };

  const handleRealisasiWeekClick = (
    row: MsaRow,
    weekNum: number,
    stage: "before" | "after",
  ) => {
    if (!realisasi) return;

    const rows = [
      ...(realisasiQuery.data?.before ?? []),
      ...(realisasiQuery.data?.after ?? []),
    ];

    setSiteWeek({
      year: Number(row.year) || realisasi.year,
      week: findActualWeekNumber(rows, realisasi.monthNum, weekNum) ?? weekNum,
      type: mapKpiToSiteTypeCode(realisasi.kpi),
      status: stage,
      region: String(row.region_tsel ?? ""),
    });
  };

  const historyRows = history.data ?? [];

  return (
    <MsaTemplate>
      <MsaSection
        title="ACHIEVEMENT PREDICTION"
        actions={
          <MsaToolbar
            treg={treg}
            filter={filter}
            showActualWeeks={showActualWeeks}
            exporting={exporting}
            onTregChange={handleTregChange}
            onFilterChange={handleFilterChange}
            onShowActualWeeksChange={setShowActualWeeks}
            onExport={handleExport}
          />
        }
      >
        <MsaPredictionPanel
          items={comply.data ?? []}
          loading={comply.isFetching}
        />

        <MsaAchievementTable
          rows={achievementRows}
          loading={achievement.isFetching && !achievementRows.length}
          error={achievement.isError}
          showActualWeeks={showActualWeeks}
          expandedKeys={achievementExpansion.expandedKeys}
          childrenByKey={achievementExpansion.childrenByKey}
          loadingKey={achievementExpansion.loadingKey}
          onToggleRow={achievementExpansion.toggleRow}
          onWeekClick={handleWeekClick}
          onRealisasiClick={handleRealisasiClick}
        />
      </MsaSection>

      <MsaSection
        title="TREND ACHIEVEMENT"
        actions={LEVEL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLevel(option.value)}
            className={`h-8 cursor-pointer rounded-full border px-3 text-xs transition-colors ${
              level === option.value
                ? "border-brand-secondary text-brand-secondary"
                : "border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            {option.label}
          </button>
        ))}
      >
        {trend.isFetching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`trend-skeleton-${index}`}
                className="rounded-2xl border border-[#dbdbdb] bg-white p-4"
              >
                <Skeleton height={260} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TREND_CHARTS.map((chart) => {
              const data = trend.data[chart.parameter];

              if (!data) return null;

              return (
                <MsaTrendChart
                  key={chart.parameter}
                  title={chart.title}
                  description={chart.description}
                  data={data}
                />
              );
            })}
          </div>
        )}
      </MsaSection>

      <MsaSection
        title={slaMode === "weekly" ? "WEEKLY DATA SLA" : "MONTHLY DATA SLA"}
        actions={
          <>
            <div className="inline-flex items-center rounded-full border border-[#dbdbdb] bg-[#ededed] p-1">
              {(["monthly", "weekly"] as MsaSlaMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSlaMode(mode)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    slaMode === mode
                      ? "bg-[#5195d4] text-white shadow-sm"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  {mode === "monthly" ? "MONTHLY DATA SLA" : "WEEKLY DATA SLA"}
                </button>
              ))}
            </div>

            {slaMode === "weekly" ? (
              <FilterDropdown
                title="Filter KPI"
                placeholder="Select KPI"
                options={WEEKLY_KPI_OPTIONS.map((option) => ({
                  label: formatWeeklyKpiLabel(option),
                  value: option,
                }))}
                value={weeklyKpi}
                onChange={setWeeklyKpi}
              />
            ) : null}
          </>
        }
      >
        {slaMode === "weekly" ? (
          <MsaHistoryWeeklyTable
            rows={historyRows}
            loading={history.isFetching && !historyRows.length}
            error={history.isError}
          />
        ) : (
          <MsaHistoryTable
            rows={historyRows}
            loading={history.isFetching && !historyRows.length}
            error={history.isError}
            expandedKeys={historyExpansion.expandedKeys}
            childrenByKey={historyExpansion.childrenByKey}
            onToggleRow={historyExpansion.toggleRow}
          />
        )}
      </MsaSection>

      <MsaWeeklyDetailModal
        open={Boolean(weeklyDetail)}
        detail={weeklyDetail}
        rows={weeklyDetailQuery.data ?? []}
        loading={weeklyDetailQuery.isFetching}
        error={weeklyDetailQuery.isError}
        onClose={() => setWeeklyDetail(null)}
      />

      <MsaRealisasiModal
        open={Boolean(realisasi)}
        kpi={realisasi?.kpi ?? ""}
        monthNum={realisasi?.monthNum ?? 1}
        data={realisasiQuery.data}
        loading={realisasiQuery.isFetching}
        error={realisasiQuery.isError}
        showActualWeeks={showActualWeeks}
        onWeekClick={handleRealisasiWeekClick}
        onClose={() => setRealisasi(null)}
      />

      <MsaSiteWeekModal
        open={Boolean(siteWeek)}
        params={siteWeek}
        rows={siteWeekQuery.data ?? []}
        loading={siteWeekQuery.isFetching}
        error={siteWeekQuery.isError}
        onClose={() => setSiteWeek(null)}
      />
    </MsaTemplate>
  );
};

export default MsaPage;
