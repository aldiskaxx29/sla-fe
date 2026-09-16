import { useEffect, useMemo, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import {
  useFbbOoklaIndihomeTypeOptionsQuery,
  useFbbOoklaKpiOptionsQuery,
  useFbbOoklaLoseRegionQuery,
  useFbbOoklaLoseRegionSummaryQuery,
  useFbbOoklaMapRegionStatusQuery,
  useFbbOoklaMetricsOptionsQuery,
  useFbbOoklaNationMetricsQuery,
  useFbbYearWeekOptionsQuery,
  useUrlPagination,
  useUrlSearchState,
} from "@/app/hooks";

import { DashboardToolbar } from "@/app/components/molecules/DashboardToolbar";
import { SectionCard } from "@/app/components/molecules/SectionCard";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { FbbOnxFilterBar } from "@/app/components/organisms/forms/FbbOnxFilterBar";
import { FbbOnxMapPanel } from "@/app/components/organisms/panels/FbbOnxMapPanel";
import { FbbLoseRegionTable } from "@/app/components/organisms/tables/FbbLoseRegionTable";
import { FbbNationMetricsTable } from "@/app/components/organisms/tables/FbbNationMetricsTable";

import DashboardContentTemplate from "@/app/components/templates/DashboardContentTemplate";

import type {
  FbbMapViewMode,
  FbbNationMetricRow,
  FbbOnxFilterState,
} from "@/app/types/fbb/onx.types";

import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

const VIEW_PARAM = "view";
const MAP_VIEW_PARAM = "map_view";

const MAP_VIEW_OPTIONS: { label: string; value: FbbMapViewMode }[] = [
  { label: "Benchmark", value: "benchmark" },
  { label: "Experience", value: "experience" },
];
const SUMMARY_PER_PAGE = 10;
const DETAIL_PER_PAGE = 100;
const DETAIL_REGION_PER_PAGE = 100;

const DEFAULT_FILTER: FbbOnxFilterState = {
  yearweek: "",
  metrics: "",
  kpi: "",
  indihomeType: "",
};

const isLose = (row: FbbNationMetricRow) =>
  String(row.status).toLowerCase() === "lose";

const FbbOoklaPage = () => {
  const [filter, setFilter] = useState<FbbOnxFilterState>(DEFAULT_FILTER);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const { searchParams, setParams } = useUrlSearchState();
  const summaryPage = useUrlPagination({ defaultPerPage: SUMMARY_PER_PAGE });
  const view = searchParams.get(VIEW_PARAM) === "detail" ? "detail" : "maps";
  const mapView: FbbMapViewMode =
    searchParams.get(MAP_VIEW_PARAM) === "experience" ? "experience" : "benchmark";
  const [viewKpi, setViewKpi] = useState("");
  const [expandedRegion, setExpandedRegion] = useState("");
  const detailRegionPage = useUrlPagination({
    defaultPerPage: DETAIL_REGION_PER_PAGE,
    pageKey: "detail_page",
    perPageKey: "detail_per_page",
  });
  const [detailPage, setDetailPage] = useState({
    page: 1,
    perPage: DETAIL_PER_PAGE,
  });

  const yearWeekOptions = useFbbYearWeekOptionsQuery();
  const metricsOptions = useFbbOoklaMetricsOptionsQuery();
  const kpiOptions = useFbbOoklaKpiOptionsQuery(filter.metrics);
  const indihomeTypeOptions = useFbbOoklaIndihomeTypeOptionsQuery();

  useEffect(() => {
    const latest = yearWeekOptions.data?.[0];
    if (latest && !filter.yearweek) {
      setFilter((current) => ({ ...current, yearweek: latest }));
    }
  }, [yearWeekOptions.data, filter.yearweek]);

  useEffect(() => {
    const first = indihomeTypeOptions.data?.[0];
    if (first && !filter.indihomeType) {
      setFilter((current) => ({ ...current, indihomeType: first }));
    }
  }, [indihomeTypeOptions.data, filter.indihomeType]);

  useEffect(() => {
    const list = kpiOptions.data;
    if (!list || !filter.kpi || list.includes(filter.kpi)) return;

    setFilter((current) => ({ ...current, kpi: "" }));
  }, [kpiOptions.data, filter.kpi]);

  const summary = useFbbOoklaNationMetricsQuery({
    yearweek: filter.yearweek,
    indihomeType: filter.indihomeType,
    metrics: filter.metrics,
    kpi: filter.kpi,
    page: summaryPage.page,
    perPage: summaryPage.perPage,
  });

  const summaryRows = useMemo(() => summary.data?.rows ?? [], [summary.data]);
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

  const mapStatus = useFbbOoklaMapRegionStatusQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      metrics: activeMetric,
      kpi: activeKpi,
    },
    view === "maps" && Boolean(activeMetric && activeKpi),
  );

  const detailRegion = useFbbOoklaLoseRegionSummaryQuery(
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

  const detail = useFbbOoklaLoseRegionQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      metrics: activeMetric,
      kpi: activeKpi,
      region: expandedRegion,
      level: "KABUPATEN",
      benchmarkStatus: "Lose",
      page: detailPage.page,
      perPage: detailPage.perPage,
    },
    view === "detail" && Boolean(activeMetric && activeKpi && expandedRegion),
  );

  const mapRows = useMemo(() => mapStatus.data ?? [], [mapStatus.data]);
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

  const handleFilterChange = (next: FbbOnxFilterState) => {
    setFilter((current) => ({
      ...next,
      kpi: next.metrics === current.metrics ? next.kpi : "",
    }));
    setExpandedRegion("");
    setParams({ page: null, detail_page: null });
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const handleViewKpiChange = (kpi: string) => {
    setViewKpi(kpi);
    setExpandedRegion("");
    detailRegionPage.resetPage();
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const handleToggleRegion = (region: string) => {
    setExpandedRegion((current) => (current === region ? "" : region));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const detailLoading = detailRegion.isFetching;

  return (
    <DashboardContentTemplate
      toolbarPlacement="inside"
      toolbar={
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
      }
    >
      <SectionCard
        className={`flex shrink-0 flex-col p-3 ${
          summaryOpen ? "gap-2" : "gap-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#020617]">Nations</span>
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
              onPageChange={summaryPage.setPagination}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard className="flex flex-1 flex-col gap-3 p-4">
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
              className="[&>div]:w-[220px] [&_button]:h-9 [&_button]:w-[220px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-white [&_button]:px-4 [&_button]:text-sm [&_button]:font-medium [&_button]:text-[#0a0a0a] [&_button>span]:truncate"
            />

            {view === "maps" && (
              <SelectMenu
                value={mapView}
                options={MAP_VIEW_OPTIONS}
                onChange={(value) =>
                  setParams({
                    [MAP_VIEW_PARAM]: value === "experience" ? "experience" : null,
                  })
                }
                size="sm"
                className="[&>div]:w-[150px] [&_button]:h-9 [&_button]:w-[150px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-white [&_button]:px-4 [&_button]:text-sm [&_button]:font-medium [&_button]:text-[#0a0a0a]"
              />
            )}
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
                onClick={() =>
                  setParams({
                    [VIEW_PARAM]: tab.key === "detail" ? "detail" : null,
                  })
                }
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
          <FbbOnxMapPanel
            rows={mapRows}
            kpi={activeKpi}
            viewMode={mapView}
            loading={mapStatus.isFetching}
            error={mapStatus.isError}
          />
        ) : (
          <FbbLoseRegionTable
            rows={detailRegionRows}
            childRows={detailRows}
            meta={detailRegion.data?.meta}
            loading={detailLoading}
            childLoading={detail.isFetching}
            error={detailRegion.isError}
            childError={detail.isError}
            expandedRegion={expandedRegion}
            onToggleRegion={handleToggleRegion}
            onPageChange={(page, perPage) => {
              detailRegionPage.setPagination(page, perPage);
              setExpandedRegion("");
              setDetailPage((current) => ({ ...current, page: 1 }));
            }}
          />
        )}
      </SectionCard>
    </DashboardContentTemplate>
  );
};

export default FbbOoklaPage;
