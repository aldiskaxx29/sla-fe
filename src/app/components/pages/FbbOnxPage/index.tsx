// React
import { useEffect, useMemo, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

// Hooks
import {
  useFbbIndihomeTypeOptionsQuery,
  useFbbKpiOptionsQuery,
  useFbbLoseRegionQuery,
  useFbbLoseRegionSummaryQuery,
  useFbbMapRegionStatusQuery,
  useFbbMetricsOptionsQuery,
  useFbbNationMetricsQuery,
  useFbbYearWeekOptionsQuery,
} from "@/app/hooks";

// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Organism
import { DashboardToolbar } from "@/app/components/organism/forms/DashboardToolbar";
import { FbbOnxFilterBar } from "@/app/components/organism/forms/FbbOnxFilterBar";
import { FbbOnxMapPanel } from "@/app/components/organism/panels/FbbOnxMapPanel";
import { FbbLoseRegionTable } from "@/app/components/organism/tables/FbbLoseRegionTable";
import { FbbNationMetricsTable } from "@/app/components/organism/tables/FbbNationMetricsTable";

// Types
import type {
  FbbNationMetricRow,
  FbbOnxFilterState,
} from "@/app/types/fbb/onx.types";

// Utils
import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

type ViewTab = "maps" | "detail";

/** Baris per halaman bawaan; keduanya bisa diubah lewat select di paginasi. */
const SUMMARY_PER_PAGE = 10;
const DETAIL_PER_PAGE = 500;
const DETAIL_REGION_PER_PAGE = 10;

/** Level tidak lagi dipilih user: ringkasan selalu nasional, detail per kabupaten. */
const SUMMARY_LEVEL = "NATION";
const DETAIL_LEVEL = "KABUPATEN";

const DEFAULT_FILTER: FbbOnxFilterState = {
  yearweek: "",
  metrics: "",
  kpi: "",
  indihomeType: "INDIHOME ALL",
};

const isLose = (row: FbbNationMetricRow) =>
  String(row.status).toLowerCase() === "lose";

/** Halaman benchmark ONX: ringkasan metrics/KPI, peta status region, dan detail kabupaten. */
const FbbOnxPage = () => {
  const [filter, setFilter] = useState<FbbOnxFilterState>(DEFAULT_FILTER);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [summaryPage, setSummaryPage] = useState({
    page: 1,
    perPage: SUMMARY_PER_PAGE,
  });
  const [view, setView] = useState<ViewTab>("maps");
  /** KPI khusus peta/detail; terpisah dari filter KPI tabel ringkasan. */
  const [viewKpi, setViewKpi] = useState("");
  const [expandedRegion, setExpandedRegion] = useState("");
  const [detailRegionPage, setDetailRegionPage] = useState({
    page: 1,
    perPage: DETAIL_REGION_PER_PAGE,
  });
  const [detailPage, setDetailPage] = useState({
    page: 1,
    perPage: DETAIL_PER_PAGE,
  });

  const yearWeekOptions = useFbbYearWeekOptionsQuery();
  const metricsOptions = useFbbMetricsOptionsQuery();
  const kpiOptions = useFbbKpiOptionsQuery(filter.metrics);
  const indihomeTypeOptions = useFbbIndihomeTypeOptionsQuery();

  // Minggu terbaru dipakai sampai user memilih sendiri.
  useEffect(() => {
    const latest = yearWeekOptions.data?.[0];
    if (latest && !filter.yearweek) {
      setFilter((current) => ({ ...current, yearweek: latest }));
    }
  }, [yearWeekOptions.data, filter.yearweek]);

  useEffect(() => {
    if (!kpiOptions.data) return;

    const hasSummaryKpi =
      !filter.kpi || kpiOptions.data.includes(filter.kpi);

    if (!hasSummaryKpi) {
      setFilter((current) => ({ ...current, kpi: "" }));
    }
  }, [filter.kpi, kpiOptions.data]);

  const summary = useFbbNationMetricsQuery({
    yearweek: filter.yearweek,
    level: SUMMARY_LEVEL,
    indihomeType: filter.indihomeType,
    metrics: filter.metrics,
    kpi: filter.kpi,
    page: summaryPage.page,
    perPage: summaryPage.perPage,
  });

  const summaryRows = useMemo(() => summary.data?.data ?? [], [summary.data]);
  const loseKpiOptions = useMemo(
    () => Array.from(new Set(summaryRows.filter(isLose).map((row) => row.kpi))),
    [summaryRows],
  );
  const activeKpi = viewKpi || loseKpiOptions[0] || filter.kpi || "";
  const activeMetric = useMemo(() => {
    if (filter.metrics) return filter.metrics;

    return (
      summaryRows.find((row) => row.kpi === activeKpi)?.metrics ??
      summaryRows[0]?.metrics ??
      ""
    );
  }, [activeKpi, filter.metrics, summaryRows]);

  const mapStatus = useFbbMapRegionStatusQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      kpi: activeKpi,
    },
    view === "maps" && Boolean(activeKpi),
  );

  const detailRegion = useFbbLoseRegionSummaryQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      metrics: activeMetric,
      kpi: activeKpi,
      page: detailRegionPage.page,
      perPage: detailRegionPage.perPage,
    },
    view === "detail" && Boolean(activeMetric && activeKpi),
  );

  const detail = useFbbLoseRegionQuery(
    {
      yearweek: filter.yearweek,
      level: DETAIL_LEVEL,
      indihomeType: filter.indihomeType,
      metrics: activeMetric,
      regionNew: expandedRegion,
      kpi: activeKpi,
      page: detailPage.page,
      perPage: detailPage.perPage,
    },
    view === "detail" && Boolean(activeMetric && activeKpi && expandedRegion),
  );

  const mapRows = useMemo(() => mapStatus.data?.data ?? [], [mapStatus.data]);
  const detailRegionRows = useMemo(
    () => detailRegion.data?.data ?? [],
    [detailRegion.data],
  );
  const detailRows = useMemo(() => detail.data?.data ?? [], [detail.data]);
  useEffect(() => {
    if (summary.isFetching) return;

    const firstLoseKpi = loseKpiOptions[0] ?? "";
    if (!viewKpi || !loseKpiOptions.includes(viewKpi)) {
      setViewKpi(firstLoseKpi);
    }
  }, [loseKpiOptions, summary.isFetching, viewKpi]);

  /** Ganti filter selalu mengembalikan paginasi ke halaman pertama. */
  const handleFilterChange = (next: FbbOnxFilterState) => {
    setFilter(next);
    setExpandedRegion("");
    setSummaryPage((current) => ({ ...current, page: 1 }));
    setDetailRegionPage((current) => ({ ...current, page: 1 }));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const handleViewKpiChange = (kpi: string) => {
    setViewKpi(kpi);
    setExpandedRegion("");
    setDetailRegionPage((current) => ({ ...current, page: 1 }));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const handleToggleRegion = (region: string) => {
    setExpandedRegion((current) => (current === region ? "" : region));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const detailLoading = detailRegion.isFetching;

  return (
    <main className="flex flex-1 flex-col p-4">
      <div className="flex flex-1 flex-col gap-4 rounded-[36px] border border-[#e2e8f0] bg-white p-4">
        <DashboardToolbar initials={toInitials(getStoredUserName())}>
          <FbbOnxFilterBar
            value={filter}
            onChange={handleFilterChange}
            loading={yearWeekOptions.isPending}
            options={{
              yearweek: yearWeekOptions.data ?? [],
              metrics: metricsOptions.data ?? [],
              kpi: kpiOptions.data ?? [],
              indihomeType: indihomeTypeOptions.data ?? [],
            }}
          />
        </DashboardToolbar>

        <section
          className={`flex shrink-0 flex-col rounded-[19px] border border-[#e2e8f0] bg-white p-3 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)] ${
            summaryOpen ? "gap-2" : "gap-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#020617]">
              Nation
            </span>
            <button
              type="button"
              aria-label={summaryOpen ? "Tutup tabel" : "Buka tabel"}
              aria-expanded={summaryOpen}
              onClick={() => setSummaryOpen((open) => !open)}
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] transition-colors hover:bg-[#eef2f6]"
            >
              <LuChevronDown
                className={`size-4 text-[#334155] transition-transform duration-300 ${
                  summaryOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          </div>

          {/* Grid-rows 0fr/1fr: tabel menutup dan membuka dengan animasi. */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <FbbNationMetricsTable
                rows={summaryRows}
                meta={summary.data?.meta}
                loading={summary.isFetching}
                error={summary.isError}
                onPageChange={(page, perPage) => setSummaryPage({ page, perPage })}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-3 rounded-[19px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SelectMenu
                value={activeKpi}
                options={loseKpiOptions.map((kpi) => ({
                  label: kpi,
                  value: kpi,
                }))}
                onChange={handleViewKpiChange}
                placeholder="Select KPI"
                size="sm"
                className="[&>div]:w-[170px] [&_button]:h-9 [&_button]:w-[170px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-white [&_button]:px-4 [&_button]:text-sm [&_button]:font-medium [&_button]:text-[#0a0a0a] [&_button>span]:truncate"
              />

            </div>

            <div className="flex items-center rounded-[48px] border border-[#e2e8f0] bg-white p-1 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
              {(
                [
                  { key: "maps", label: "Map View" },
                  { key: "detail", label: "Detail View" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setView(tab.key)}
                  className={`cursor-pointer rounded-[48px] px-3 py-1 text-sm font-medium transition-colors ${
                    view === tab.key
                      ? "bg-[#3b82f6] text-white"
                      : "text-[#64748b] hover:text-[#334155]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {view === "maps" ? (
            <div className="h-[520px]">
              <FbbOnxMapPanel
                rows={mapRows}
                kpi={activeKpi}
                loading={mapStatus.isFetching}
                error={mapStatus.isError}
              />
            </div>
          ) : (
            <FbbLoseRegionTable
              rows={detailRegionRows}
              childRows={detailRows}
              meta={detailRegion.data?.meta}
              childMeta={detail.data?.meta}
              loading={detailLoading}
              childLoading={detail.isFetching}
              error={detailRegion.isError}
              childError={detail.isError}
              expandedRegion={expandedRegion}
              onToggleRegion={handleToggleRegion}
              onPageChange={(page, perPage) => {
                setDetailRegionPage({ page, perPage });
                setExpandedRegion("");
                setDetailPage((current) => ({ ...current, page: 1 }));
              }}
              onChildPageChange={(page, perPage) => setDetailPage({ page, perPage })}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default FbbOnxPage;
