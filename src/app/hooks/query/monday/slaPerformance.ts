// React Query
import { useQuery } from "@tanstack/react-query";

// Dayjs
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

// Api
import {
  getAccessPacketLossTotals,
  getCnopAccessSla,
  getCoreSla,
  getMsaAccessSla,
  getMttrRegionSla,
  mondayMonitoringKeys,
} from "@/app/api";

// Types
import type {
  AccessPlTotal,
  SlaPeriod,
  SlaRekon,
  SlaPerformanceSources,
} from "@/app/types/monday/slaPerformance.types";
import type { SLAMetricCard } from "@/app/types/monday/ticketQuality.types";

// Utils
import { buildSlaPerformanceCards } from "@/app/utils/slaPerformance.utils";

dayjs.extend(isLeapYear);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

/** Data minggu berjalan biasanya belum ada, jadi mundur beberapa minggu. */
const LATEST_WEEK_LOOKBACK = 4;

const toYearWeek = (date: dayjs.Dayjs) =>
  `${date.isoWeekYear()}${String(date.isoWeek()).padStart(2, "0")}`;

/** Daftar yearweek terbaru lebih dulu, mis. ["202637", "202636", ...]. */
const getRecentYearWeeks = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    toYearWeek(dayjs().subtract(index, "week")),
  );

export const shiftYearWeek = (yearWeek: string, weeks: number) => {
  const year = Number(yearWeek.slice(0, 4));
  const week = Number(yearWeek.slice(4));

  if (!Number.isFinite(year) || !Number.isFinite(week)) return yearWeek;

  return toYearWeek(dayjs().year(year).isoWeek(week).add(weeks, "week"));
};

export const formatYearWeekShort = (yearWeek: string) =>
  `W${Number(yearWeek.slice(4))}`;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** Minggu ISO yang hari Senin-nya jatuh di bulan tersebut. */
const getYearWeeksOfMonth = (date: dayjs.Dayjs) => {
  const weeks: string[] = [];
  let cursor = date.startOf("month").startOf("isoWeek");

  // Minggu pertama bisa dimulai di bulan sebelumnya, jadi dilewati.
  if (cursor.month() !== date.month()) cursor = cursor.add(1, "week");

  while (cursor.month() === date.month() && cursor.year() === date.year()) {
    weeks.push(toYearWeek(cursor));
    cursor = cursor.add(1, "week");
  }

  return weeks;
};

const sumAccessPl = (totals: AccessPlTotal[][]): AccessPlTotal[] => {
  const sums: Record<string, number> = {};

  totals.flat().forEach((row) => {
    const key = String(row.distribution_pl ?? "");
    if (!key) return;

    sums[key] = (sums[key] ?? 0) + (Number(row.total) || 0);
  });

  return Object.entries(sums).map(([distribution_pl, total]) => ({
    distribution_pl,
    total,
  }));
};

/**
 * Snapshot JSON di server lama tidak menerima parameter minggu; hanya jumlah
 * site packet loss access yang per minggu. Jadi minggu terbaru dicari dengan
 * mundur dari minggu berjalan sampai ketemu yang datanya ada.
 */
export const useLatestPacketLossWeekQuery = () =>
  useQuery({
    queryKey: mondayMonitoringKeys.latestPlWeek(),
    queryFn: async ({ signal }) => {
      const candidates = getRecentYearWeeks(LATEST_WEEK_LOOKBACK);

      for (const yearWeek of candidates) {
        const totals = await getAccessPacketLossTotals(yearWeek, signal);
        if (totals.length) return yearWeek;
      }

      return candidates[candidates.length - 1];
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

export const useSlaPerformanceQuery = (
  yearWeek: string | null,
  rekon: SlaRekon,
  period: SlaPeriod = "week",
) =>
  useQuery<SLAMetricCard[]>({
    queryKey: [
      ...mondayMonitoringKeys.slaPerformance(yearWeek ?? "", rekon),
      period,
    ],
    enabled: Boolean(yearWeek),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const currentWeek = yearWeek as string;
      const previousWeek = shiftYearWeek(currentWeek, -1);

      // Periode bulanan: jumlah site PL access diakumulasi per bulan, memakai
      // bulan tempat minggu terakhir berada dan bulan sebelumnya.
      const anchor = dayjs()
        .year(Number(currentWeek.slice(0, 4)))
        .isoWeek(Number(currentWeek.slice(4)));
      const currentMonthWeeks = getYearWeeksOfMonth(anchor);
      const previousMonthWeeks = getYearWeeksOfMonth(
        anchor.startOf("month").subtract(1, "month"),
      );

      const [
        packetLoss5,
        packetLoss15,
        latencyAccess,
        jitterAccess,
        mttrMajor,
        mttrMinor,
        mttrCritical,
        corePacketLoss,
        coreJitter,
        coreLatencyBds,
        coreLatencyBtc,
        coreLatencyPnk,
        plCurrentWeek,
        plPreviousWeek,
      ] = await Promise.all([
        getMsaAccessSla(rekon, "packetloss5", signal),
        getMsaAccessSla(rekon, "packetloss15", signal),
        getCnopAccessSla(rekon, "latency", signal),
        getCnopAccessSla(rekon, "jitter", signal),
        getMttrRegionSla(rekon, "regionMajor", period, signal),
        getMttrRegionSla(rekon, "regionMinor", period, signal),
        getMttrRegionSla(rekon, "regionCritical", period, signal),
        getCoreSla("packetloss", signal),
        getCoreSla("jitter", signal),
        getCoreSla("latency_bds", signal),
        getCoreSla("latency_btc", signal),
        getCoreSla("latency_pnk", signal),
        period === "month"
          ? Promise.all(
              currentMonthWeeks.map((week) =>
                getAccessPacketLossTotals(week, signal),
              ),
            ).then(sumAccessPl)
          : getAccessPacketLossTotals(currentWeek, signal),
        period === "month"
          ? Promise.all(
              previousMonthWeeks.map((week) =>
                getAccessPacketLossTotals(week, signal),
              ),
            ).then(sumAccessPl)
          : getAccessPacketLossTotals(previousWeek, signal),
      ]);

      const sources: SlaPerformanceSources = {
        packetLoss5,
        packetLoss15,
        latencyAccess,
        jitterAccess,
        mttrMajor,
        mttrMinor,
        mttrCritical,
        corePacketLoss,
        coreJitter,
        coreLatency: [
          { code: "BDS", rows: coreLatencyBds },
          { code: "BTC", rows: coreLatencyBtc },
          { code: "PNK", rows: coreLatencyPnk },
        ],
        // `accessPl` tidak punya parameter rekon, jadi untuk After Rekon jangan
        // pakai total before dari endpoint itu. Builder akan fallback ke
        // `realisasi` NATION WIDE dari JSON after packetloss{5,15}.
        plCurrentWeek: rekon === "after" ? [] : plCurrentWeek,
        plPreviousWeek,
        currentWeekLabel:
          period === "month"
            ? MONTH_LABELS[anchor.month()]
            : formatYearWeekShort(currentWeek),
        previousWeekLabel:
          period === "month"
            ? MONTH_LABELS[anchor.subtract(1, "month").month()]
            : formatYearWeekShort(previousWeek),
      };

      return buildSlaPerformanceCards(sources);
    },
  });
