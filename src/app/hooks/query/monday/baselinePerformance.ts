import { useQuery } from "@tanstack/react-query";

import {
  getBaselinePerformance,
  getBaselineTrend,
  mondayMonitoringKeys,
} from "@/app/api";

import type {
  BaselinePerformanceData,
  BaselineRegionRaw,
  BaselineRegionRow,
  BaselineStatus,
  BaselineTrendData,
  BaselineTrendSeries,
} from "@/app/types/monday/baseline.types";

export const BASELINE_CRITICAL_THRESHOLD = 20;
export const BASELINE_WARNING_THRESHOLD = 10;

const toStatus = (worstPersen: number): BaselineStatus => {
  if (worstPersen >= BASELINE_CRITICAL_THRESHOLD) return "critical";
  if (worstPersen >= BASELINE_WARNING_THRESHOLD) return "warning";
  return "good";
};

const toRow = (raw: BaselineRegionRaw): BaselineRegionRow => {
  const worstPersen = Math.max(Number(raw.latPersen) || 0, Number(raw.pacPersen) || 0);

  return { ...raw, worstPersen, status: toStatus(worstPersen) };
};

export const useBaselinePerformanceQuery = () =>
  useQuery<BaselinePerformanceData>({
    queryKey: mondayMonitoringKeys.baselinePerformance(),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const rows = await getBaselinePerformance(signal);
      const mapped = (Array.isArray(rows) ? rows : []).map(toRow);

      return {
        regions: mapped.filter(
          (row) => row.region.toUpperCase() !== "NATION",
        ),
        nation:
          mapped.find((row) => row.region.toUpperCase() === "NATION") ?? null,
      };
    },
  });

const formatWeekLabel = (raw: string) => {
  const text = String(raw ?? "");
  if (text.length < 5) return text;

  return `${text.slice(0, 4)} W${Number(text.slice(4))}`;
};

const toSeriesMap = (series: BaselineTrendSeries[] = []) =>
  series.reduce<Record<string, number[]>>((acc, item) => {
    acc[String(item.name).toUpperCase()] = (item.data ?? []).map((value) =>
      Number(value ?? 0),
    );
    return acc;
  }, {});

export const useBaselineTrendQuery = (enabled = true) =>
  useQuery<BaselineTrendData>({
    queryKey: mondayMonitoringKeys.baselineTrend(),
    enabled,
    staleTime: 10 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await getBaselineTrend(signal);

      return {
        weeks: (response?.week ?? []).map(formatWeekLabel),
        latency: toSeriesMap(response?.latency),
        packetloss: toSeriesMap(response?.packetloss),
      };
    },
  });
