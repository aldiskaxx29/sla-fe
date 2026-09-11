// React
import { useEffect, useMemo, useState } from "react";

// Hooks
import { useFbbSlaWsaQuery, useFbbYearWeekQuery } from "@/app/hooks";
import { useFbbHeaderBadge } from "@/app/layout/AppLayoutFbb/context";

// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Organism
import { FbbSlaSummaryPanel } from "@/app/components/organism/panels/FbbSlaSummaryPanel";
import { FbbSlaIndicatorTable } from "@/app/components/organism/tables/FbbSlaIndicatorTable";

// Utils
import {
  buildPeriodLabel,
  formatYearWeek,
  formatYearWeekShort,
  summarizeAchievements,
} from "@/app/utils/fbbSla.utils";

/** Halaman SLA WISA FBB: ringkasan indikator dan tabelnya per minggu. */
const FbbSlaPage = () => {
  const [yearweek, setYearweek] = useState<string | null>(null);

  const {
    data: yearWeekData,
    isFetching: isFetchingYearWeek,
    isError: isYearWeekError,
  } = useFbbYearWeekQuery();

  /** Minggu berjalan menurut server; jadi pilihan awal sekaligus batas daftar. */
  const activeYearWeek = useMemo(() => {
    if (!yearWeekData) return null;

    const fallback = yearWeekData.data?.[yearWeekData.data.length - 1];
    const active = yearWeekData.active_yearweek ?? fallback;

    return active ? String(active) : null;
  }, [yearWeekData]);

  // Default ke minggu aktif selama user belum memilih sendiri.
  useEffect(() => {
    if (yearweek || !activeYearWeek) return;

    setYearweek(activeYearWeek);
  }, [activeYearWeek, yearweek]);

  const {
    data: slaData,
    isFetching: isFetchingSla,
    isError: isSlaError,
    refetch,
  } = useFbbSlaWsaQuery(yearweek);

  const rows = useMemo(() => slaData?.data ?? [], [slaData]);

  // API mengirim seluruh minggu setahun (sampai W52); minggu yang belum
  // berjalan tidak perlu ditawarkan.
  const weekOptions = useMemo(() => {
    const weeks = [...(yearWeekData?.data ?? [])].map(String);
    const limit = activeYearWeek ? Number(activeYearWeek) : null;

    return weeks
      .filter((week) => limit === null || Number(week) <= limit)
      .sort((a, b) => b.localeCompare(a))
      .map((week) => ({ label: formatYearWeek(week), value: week }));
  }, [yearWeekData, activeYearWeek]);

  const summary = summarizeAchievements(rows);
  const periodLabel = buildPeriodLabel(rows, yearweek ?? undefined);
  const columnLabel = formatYearWeekShort(rows[0]?.yearweek ?? yearweek ?? "");

  const isLoading = isFetchingSla || (!yearweek && isFetchingYearWeek);
  const errorMessage =
    isSlaError || (slaData && slaData.status === false)
      ? "Gagal memuat data SLA WISA FBB."
      : isYearWeekError && !yearweek
        ? "Gagal memuat daftar minggu."
        : null;

  // Judul halaman ada di header shell FBB; halaman ini hanya menitipkan periode.
  useFbbHeaderBadge(periodLabel);

  return (
    <div className="m-6 flex flex-col gap-4">
      <FbbSlaSummaryPanel
        total={summary.total}
        achieved={summary.achieved}
        notAchieved={summary.notAchieved}
        loading={isLoading}
      />

      <section className="rounded-xl border border-[#DBDBDB] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[13px] font-semibold text-slate-500">
            Showing {rows.length} entries
          </span>

          <SelectMenu
            value={yearweek ?? ""}
            options={weekOptions}
            onChange={setYearweek}
            placeholder="Select Week"
            size="sm"
          />
        </div>

        <div className="p-4">
          <FbbSlaIndicatorTable
            indicators={rows}
            periodLabel={columnLabel}
            loading={isLoading}
            errorMessage={errorMessage}
            onRetry={refetch}
          />
        </div>
      </section>
    </div>
  );
};

export default FbbSlaPage;
