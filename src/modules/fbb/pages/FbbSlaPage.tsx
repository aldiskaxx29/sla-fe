import { useEffect, useMemo, useState } from "react";

import SlaIndicatorTable from "@/modules/fbb/components/SlaIndicatorTable";
import SlaSelect from "@/modules/fbb/components/SlaSelect";
import SlaStatCards from "@/modules/fbb/components/SlaStatCards";
import {
  SLA_ACHIEVEMENT_THRESHOLD,
  SLA_FBB_TITLE,
} from "@/modules/fbb/constants/slaFbb";
import {
  useFbbSlaWsaQuery,
  useFbbYearWeekQuery,
} from "@/modules/fbb/rtk/fbb.rtk";
import {
  buildPeriodLabel,
  formatYearWeek,
  formatYearWeekShort,
  parseAchievement,
} from "@/modules/fbb/utils/sla.utils";

const FbbSlaPage = () => {
  const [yearweek, setYearweek] = useState<string | null>(null);

  const {
    data: yearWeekData,
    isFetching: isFetchingYearWeek,
    isError: isYearWeekError,
  } = useFbbYearWeekQuery();

  // Default ke minggu aktif dari API selama user belum memilih sendiri.
  useEffect(() => {
    if (yearweek || !yearWeekData) return;

    const fallback = yearWeekData.data?.[yearWeekData.data.length - 1];
    const active = yearWeekData.active_yearweek ?? fallback;

    if (active) setYearweek(String(active));
  }, [yearWeekData, yearweek]);

  const {
    data: slaData,
    isFetching: isFetchingSla,
    isError: isSlaError,
    refetch,
  } = useFbbSlaWsaQuery(
    { yearweek: yearweek ?? undefined },
    { skip: !yearweek },
  );

  const rows = useMemo(() => slaData?.data ?? [], [slaData]);

  const weekOptions = useMemo(
    () =>
      [...(yearWeekData?.data ?? [])]
        .map(String)
        .sort((a, b) => b.localeCompare(a))
        .map((week) => ({ label: formatYearWeek(week), value: week })),
    [yearWeekData],
  );

  const achievements = rows
    .map((row) => parseAchievement(row.capaian))
    .filter((value): value is number => value !== null);
  const achieved = achievements.filter(
    (value) => value >= SLA_ACHIEVEMENT_THRESHOLD,
  ).length;
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
    <div className="min-h-[calc(100vh-96px)] bg-[#FAFAFA]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#EBEBEB] bg-white px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight text-[#18181B]">
          {SLA_FBB_TITLE}
        </h1>
        <span className="rounded-full bg-[#F4F4F5] px-4 py-1.5 text-[13px] text-[#71717A]">
          {periodLabel}
        </span>
      </div>

      <div className="flex flex-col gap-4 px-6 py-6">
        <SlaStatCards
          total={rows.length}
          achieved={achieved}
          notAchieved={achievements.length - achieved}
          loading={isLoading}
        />

        <div className="rounded-2xl border border-[#EBEBEB] bg-white">
          <div className="flex flex-col gap-3 px-6 py-5 lg:flex-row lg:items-center lg:justify-end">
            <div className="flex flex-wrap items-center gap-3">
              <SlaSelect
                placeholder="Select Week"
                options={weekOptions}
                value={yearweek}
                onChange={setYearweek}
                allowClear={false}
                loading={isFetchingYearWeek}
              />
            </div>
          </div>

          <div className="border-y border-[#F1F1F2] bg-[#FCFCFC] px-6 py-3">
            <span className="rounded-full bg-[#F4F4F5] px-4 py-1.5 text-[13px] text-[#71717A]">
              Showing {rows.length} entries
            </span>
          </div>

          <div className="px-4 py-4">
            <SlaIndicatorTable
              indicators={rows}
              periodLabel={columnLabel}
              loading={isLoading}
              errorMessage={errorMessage}
              onRetry={refetch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FbbSlaPage;
