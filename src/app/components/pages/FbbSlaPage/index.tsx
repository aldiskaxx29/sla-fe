// React
import { useEffect, useMemo, useState } from "react";
import { LuCalendarDays } from "react-icons/lu";

// Hooks
import { useFbbSlaWsaQuery, useFbbYearWeekQuery } from "@/app/hooks";

// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Organism
import { DashboardToolbar } from "@/app/components/organism/forms/DashboardToolbar";
import { FbbSlaSummaryPanel } from "@/app/components/organism/panels/FbbSlaSummaryPanel";
import { FbbSlaIndicatorTable } from "@/app/components/organism/tables/FbbSlaIndicatorTable";

// Utils
import {
  buildPeriodLabel,
  formatYearWeek,
  formatYearWeekShort,
  summarizeAchievements,
} from "@/app/utils/fbbSla.utils";
import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

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

  return (
    <>
      <div className="px-6 pt-2 pb-4">
        <DashboardToolbar
          initials={toInitials(getStoredUserName())}
          actions={
            <SelectMenu
              value={yearweek ?? ""}
              options={weekOptions}
              onChange={setYearweek}
              placeholder="Select Week"
              size="sm"
              className="[&_button]:h-8 [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-[#f8fafc] [&_button]:px-3 [&_button]:text-sm [&_button]:font-medium"
            />
          }
        >
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.06)]">
            <LuCalendarDays className="size-5 shrink-0 text-[#64748b]" />
            <span className="text-sm font-medium whitespace-nowrap text-[#64748b]">
              {periodLabel}
            </span>
          </div>
        </DashboardToolbar>
      </div>

      <main className="flex flex-1 flex-col px-6 pb-6">
        <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[36px] border border-[#e2e8f0] bg-white p-4">
          <FbbSlaSummaryPanel
            total={summary.total}
            achieved={summary.achieved}
            notAchieved={summary.notAchieved}
            loading={isLoading}
          />

          {/* `@container`: lebar kolom tabel menyesuaikan ruang kartu ini,
              bukan lebar layar — jadi ikut berubah saat sidebar dibuka. */}
          <div className="@container flex min-h-0 flex-1 flex-col gap-4 rounded-[19px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              <span className="flex h-9 shrink-0 items-center rounded-full bg-[#f1f5f9] px-3 text-sm font-medium text-[#64748b]">
                Showing {rows.length} entries
              </span>
            </div>

            <FbbSlaIndicatorTable
              indicators={rows}
              periodLabel={columnLabel}
              loading={isLoading}
              errorMessage={errorMessage}
              onRetry={refetch}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default FbbSlaPage;
