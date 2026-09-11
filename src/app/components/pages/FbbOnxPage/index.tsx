// React
import { useEffect, useMemo, useState } from "react";
import { LuChevronUp } from "react-icons/lu";

// Hooks
import {
  useFbbIndihomeTypeOptionsQuery,
  useFbbKpiOptionsQuery,
  useFbbLevelOptionsQuery,
  useFbbLoseRegionQuery,
  useFbbMapRegionStatusQuery,
  useFbbMetricsOptionsQuery,
  useFbbNationMetricsQuery,
  useFbbYearWeekOptionsQuery,
} from "@/app/hooks";

// Templates
import FbbOnxTemplate from "@/app/components/templates/FbbOnxTemplate";

// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Organism
import { FbbOnxFilterSidebar } from "@/app/components/organism/forms/FbbOnxFilterSidebar";
import { FbbOnxMapPanel } from "@/app/components/organism/panels/FbbOnxMapPanel";
import { FbbLoseRegionTable } from "@/app/components/organism/tables/FbbLoseRegionTable";
import { FbbNationMetricsTable } from "@/app/components/organism/tables/FbbNationMetricsTable";

// Types
import type { FbbOnxFilterState } from "@/app/types/fbb/onx.types";

type ViewTab = "maps" | "detail";

/** Baris per halaman bawaan; keduanya bisa diubah lewat select di paginasi. */
const SUMMARY_PER_PAGE = 5;
const DETAIL_PER_PAGE = 10;

const DEFAULT_FILTER: FbbOnxFilterState = {
  yearweek: "",
  metrics: "",
  kpi: "",
  level: "KABUPATEN",
  indihomeType: "INDIHOME ALL",
};

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
  const [areaName, setAreaName] = useState("");
  const [detailPage, setDetailPage] = useState({
    page: 1,
    perPage: DETAIL_PER_PAGE,
  });

  const yearWeekOptions = useFbbYearWeekOptionsQuery();
  const metricsOptions = useFbbMetricsOptionsQuery();
  const kpiOptions = useFbbKpiOptionsQuery();
  const levelOptions = useFbbLevelOptionsQuery();
  const indihomeTypeOptions = useFbbIndihomeTypeOptionsQuery();

  // Minggu terbaru dan KPI pertama dipakai sampai user memilih sendiri.
  useEffect(() => {
    const latest = yearWeekOptions.data?.[0];
    if (latest && !filter.yearweek) {
      setFilter((current) => ({ ...current, yearweek: latest }));
    }
  }, [yearWeekOptions.data, filter.yearweek]);

  useEffect(() => {
    const first = kpiOptions.data?.[0];
    if (first && !viewKpi) setViewKpi(first);
  }, [kpiOptions.data, viewKpi]);

  const summary = useFbbNationMetricsQuery({
    yearweek: filter.yearweek,
    level: filter.level,
    indihomeType: filter.indihomeType,
    metrics: filter.metrics,
    kpi: filter.kpi,
    page: summaryPage.page,
    perPage: summaryPage.perPage,
  });

  const mapStatus = useFbbMapRegionStatusQuery(
    {
      yearweek: filter.yearweek,
      indihomeType: filter.indihomeType,
      kpi: viewKpi,
    },
    view === "maps",
  );

  const detail = useFbbLoseRegionQuery(
    {
      yearweek: filter.yearweek,
      level: filter.level,
      indihomeType: filter.indihomeType,
      kpi: viewKpi,
      areaName,
      page: detailPage.page,
      perPage: detailPage.perPage,
    },
    view === "detail",
  );

  const summaryRows = useMemo(() => summary.data?.data ?? [], [summary.data]);
  const mapRows = useMemo(() => mapStatus.data?.data ?? [], [mapStatus.data]);
  const detailRows = useMemo(() => detail.data?.data ?? [], [detail.data]);

  /** Ganti filter selalu mengembalikan paginasi ke halaman pertama. */
  const handleFilterChange = (next: FbbOnxFilterState) => {
    setFilter(next);
    setSummaryPage((current) => ({ ...current, page: 1 }));
    setDetailPage((current) => ({ ...current, page: 1 }));
  };

  const openRegionDetail = (region: string) => {
    setAreaName(region);
    setDetailPage((current) => ({ ...current, page: 1 }));
    setView("detail");
  };

  return (
    <FbbOnxTemplate
      sidebar={
        <FbbOnxFilterSidebar
          value={filter}
          onChange={handleFilterChange}
          loading={yearWeekOptions.isPending}
          options={{
            yearweek: yearWeekOptions.data ?? [],
            metrics: metricsOptions.data ?? [],
            kpi: kpiOptions.data ?? [],
            level: levelOptions.data ?? [],
            indihomeType: indihomeTypeOptions.data ?? [],
          }}
        />
      }
    >
      <section className="relative rounded-xl border border-[#DBDBDB] bg-white p-4">
        <button
          type="button"
          onClick={() => setSummaryOpen((open) => !open)}
          aria-label={summaryOpen ? "Sembunyikan ringkasan" : "Tampilkan ringkasan"}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-navy"
        >
          <LuChevronUp
            size={15}
            className={`transition-transform ${summaryOpen ? "" : "rotate-180"}`}
          />
        </button>

        {summaryOpen ? (
          <FbbNationMetricsTable
            rows={summaryRows}
            meta={summary.data?.meta}
            loading={summary.isPending || summary.isFetching}
            error={summary.isError}
            onPageChange={(page, perPage) => setSummaryPage({ page, perPage })}
          />
        ) : (
          <p className="pr-10 text-[13px] font-semibold text-slate-500">
            Ringkasan metrics &amp; KPI disembunyikan.
          </p>
        )}
      </section>

      <section className="flex min-h-[520px] flex-col rounded-xl border border-[#DBDBDB] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <SelectMenu
              value={viewKpi}
              options={(kpiOptions.data ?? []).map((kpi) => ({
                label: kpi,
                value: kpi,
              }))}
              onChange={setViewKpi}
              placeholder="Select KPI"
              size="md"
            />

            {areaName && (
              <button
                type="button"
                onClick={() => setAreaName("")}
                className="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Area: {areaName} ✕
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(
              [
                { key: "maps", label: "Maps" },
                { key: "detail", label: "Detail" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-[12px] font-extrabold transition-all ${
                  view === tab.key
                    ? "bg-[#007BFF] text-white shadow-xs"
                    : "text-slate-500 hover:text-navy"
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
            loading={mapStatus.isPending || mapStatus.isFetching}
            error={mapStatus.isError}
            onOpenDetail={openRegionDetail}
          />
        ) : (
          <FbbLoseRegionTable
            rows={detailRows}
            meta={detail.data?.meta}
            loading={detail.isPending || detail.isFetching}
            error={detail.isError}
            onPageChange={(page, perPage) => setDetailPage({ page, perPage })}
          />
        )}
      </section>
    </FbbOnxTemplate>
  );
};

export default FbbOnxPage;
