// React
import { useEffect, useMemo, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

// Hooks
import {
  useFbbOoklaIndihomeTypeOptionsQuery,
  useFbbOoklaKpiOptionsQuery,
  useFbbOoklaLoseRegionQuery,
  useFbbOoklaMapRegionStatusQuery,
  useFbbOoklaMetricsOptionsQuery,
  useFbbOoklaNationMetricsQuery,
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
import type { FbbOnxFilterState } from "@/app/types/fbb/onx.types";

// Utils
import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

const SUMMARY_PER_PAGE = 10;
const DETAIL_PER_PAGE = 10;

const DEFAULT_FILTER: FbbOnxFilterState = {
  yearweek: "",
  metrics: "",
  kpi: "",
  level: "KABUPATEN",
  indihomeType: "",
};

/** Dashboard Ookla: Details Metrics, peta & detail kabupaten dari API Ookla. */
const FbbOoklaPage = () => {
  const [filter, setFilter] = useState<FbbOnxFilterState>(DEFAULT_FILTER);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [summaryPage, setSummaryPage] = useState({
    page: 1,
    perPage: SUMMARY_PER_PAGE,
  });
  const [view, setView] = useState<"maps" | "detail">("maps");
  const [viewKpi, setViewKpi] = useState("");
  const [detailPage, setDetailPage] = useState({
    page: 1,
    perPage: DETAIL_PER_PAGE,
  });

  const yearWeekOptions = useFbbYearWeekOptionsQuery();
  const metricsOptions = useFbbOoklaMetricsOptionsQuery();
  const kpiOptions = useFbbOoklaKpiOptionsQuery(filter.metrics);
  const indihomeTypeOptions = useFbbOoklaIndihomeTypeOptionsQuery();

  // Minggu terbaru, metrics pertama, dan tipe indihome pertama jadi nilai awal.
  useEffect(() => {
    const latest = yearWeekOptions.data?.[0];
    if (latest && !filter.yearweek) {
      setFilter((current) => ({ ...current, yearweek: latest }));
    }
  }, [yearWeekOptions.data, filter.yearweek]);

  useEffect(() => {
    const first = metricsOptions.data?.[0];
    if (first && !filter.metrics) {
      setFilter((current) => ({ ...current, metrics: first }));
    }
  }, [metricsOptions.data, filter.metrics]);

  useEffect(() => {
    const first = indihomeTypeOptions.data?.[0];
    if (first && !filter.indihomeType) {
      setFilter((current) => ({ ...current, indihomeType: first }));
    }
  }, [indihomeTypeOptions.data, filter.indihomeType]);

  // Daftar KPI ikut metrics, jadi pilihannya direset saat metrics berganti.
  useEffect(() => {
    const list = kpiOptions.data;
    if (!list?.length) return;
    if (filter.kpi && list.includes(filter.kpi)) return;

    setFilter((current) => ({ ...current, kpi: list[0] }));
  }, [kpiOptions.data, filter.kpi]);

  useEffect(() => {
    const first = kpiOptions.data?.[0];
    if (first && !viewKpi) setViewKpi(first);
  }, [kpiOptions.data, viewKpi]);

  const summary = useFbbOoklaNationMetricsQuery({
    yearweek: filter.yearweek,
    indihomeType: filter.indihomeType,
    metrics: filter.metrics,
    kpi: filter.kpi,
    page: summaryPage.page,
    perPage: summaryPage.perPage,
  });

  const mapStatus = useFbbOoklaMapRegionStatusQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      metrics: filter.metrics,
      kpi: viewKpi,
    },
    view === "maps",
  );

  const detail = useFbbOoklaLoseRegionQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      metrics: filter.metrics,
      kpi: viewKpi,
      level: "KABUPATEN",
      page: detailPage.page,
      perPage: detailPage.perPage,
    },
    view === "detail",
  );

  const summaryRows = useMemo(() => summary.data?.rows ?? [], [summary.data]);
  const mapRows = useMemo(() => mapStatus.data ?? [], [mapStatus.data]);
  const detailRows = useMemo(() => detail.data?.data ?? [], [detail.data]);

  const handleFilterChange = (next: FbbOnxFilterState) => {
    setFilter((current) => ({
      ...next,
      // Ganti metrics membuat daftar KPI berubah, jadi KPI-nya dikosongkan.
      kpi: next.metrics === current.metrics ? next.kpi : "",
    }));
    setSummaryPage((current) => ({ ...current, page: 1 }));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const handleViewKpiChange = (kpi: string) => {
    setViewKpi(kpi);
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

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
              Details Metrics
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
                value={viewKpi}
                options={(kpiOptions.data ?? []).map((kpi) => ({
                  label: kpi,
                  value: kpi,
                }))}
                onChange={handleViewKpiChange}
                placeholder="Select KPI"
                size="sm"
                className="[&>div]:w-[220px] [&_button]:h-9 [&_button]:w-[220px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-white [&_button]:px-4 [&_button]:text-sm [&_button]:font-medium [&_button]:text-[#0a0a0a] [&_button>span]:truncate"
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
            <FbbOnxMapPanel
              rows={mapRows}
              kpi={viewKpi}
              loading={mapStatus.isFetching}
              error={mapStatus.isError}
            />
          ) : (
            <FbbLoseRegionTable
              rows={detailRows}
              meta={detail.data?.meta}
              loading={detail.isFetching}
              error={detail.isError}
              onPageChange={(page, perPage) => setDetailPage({ page, perPage })}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default FbbOoklaPage;
