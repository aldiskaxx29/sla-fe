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
  SlaRekon,
  SlaPerformanceSources,
} from "@/app/types/monday/slaPerformance.types";
import type { SLAMetricCard } from "@/app/types/monday/ticketQuality.types";

// Utils
import { buildSlaPerformanceCards } from "@/app/utils/slaPerformance.utils";

dayjs.extend(isLeapYear);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

const WEEK_OPTION_COUNT = 8;
/** Data minggu berjalan biasanya belum ada, jadi mundur beberapa minggu. */
const LATEST_WEEK_LOOKBACK = 4;

const toYearWeek = (date: dayjs.Dayjs) =>
  `${date.isoWeekYear()}${String(date.isoWeek()).padStart(2, "0")}`;

/** Daftar yearweek terbaru lebih dulu, mis. ["202637", "202636", ...]. */
export const getRecentYearWeeks = (count = WEEK_OPTION_COUNT) =>
  Array.from({ length: count }, (_, index) =>
    toYearWeek(dayjs().subtract(index, "week")),
  );

export const shiftYearWeek = (yearWeek: string, weeks: number) => {
  const year = Number(yearWeek.slice(0, 4));
  const week = Number(yearWeek.slice(4));

  if (!Number.isFinite(year) || !Number.isFinite(week)) return yearWeek;

  return toYearWeek(dayjs().year(year).isoWeek(week).add(weeks, "week"));
};

export const formatYearWeekLabel = (yearWeek: string) =>
  `Week ${Number(yearWeek.slice(4))}`;

export const formatYearWeekShort = (yearWeek: string) =>
  `W${Number(yearWeek.slice(4))}`;

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
) =>
  useQuery<SLAMetricCard[]>({
    queryKey: mondayMonitoringKeys.slaPerformance(yearWeek ?? "", rekon),
    enabled: Boolean(yearWeek),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const currentWeek = yearWeek as string;
      const previousWeek = shiftYearWeek(currentWeek, -1);

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
        getMttrRegionSla(rekon, "regionMajor", signal),
        getMttrRegionSla(rekon, "regionMinor", signal),
        getMttrRegionSla(rekon, "regionCritical", signal),
        getCoreSla("packetloss", signal),
        getCoreSla("jitter", signal),
        getCoreSla("latency_bds", signal),
        getCoreSla("latency_btc", signal),
        getCoreSla("latency_pnk", signal),
        getAccessPacketLossTotals(currentWeek, signal),
        getAccessPacketLossTotals(previousWeek, signal),
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
        plCurrentWeek,
        plPreviousWeek,
        currentWeekLabel: formatYearWeekShort(currentWeek),
        previousWeekLabel: formatYearWeekShort(previousWeek),
      };

      return buildSlaPerformanceCards(sources);
    },
  });
