import { useQuery } from "@tanstack/react-query";

import {
  getCtiMonitoring,
  getCtiTransitDetail,
  getTrendQualityChart,
  mondayMonitoringKeys,
} from "@/app/api";

import type { CtiRow } from "@/app/types/monday/ticketQuality.types";
import type {
  CtiRawRow,
  CtiVerifier,
  TrendKind,
  TrendMetric,
  TrendScope,
} from "@/app/types/monday/trendQuality.types";

export interface TrendQualityData {
  weeks: string[];
  weekInfo: string[];
  series: { name: string; data: (number | null)[] }[];
  unit: string;
}

const METRIC_UNIT: Record<TrendMetric, string> = {
  latency: "ms",
  packetloss: "%",
  jitter: "ms",
};

const parseHtmlNumber = (value?: string | number | null) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;

  const text = value.replace(/<[^>]*>/g, " ").trim();
  const numeric = Number(text.replace(",", "."));

  return Number.isFinite(numeric) ? numeric : 0;
};

export const useTrendQualityQuery = (
  kind: TrendKind,
  metric: TrendMetric,
  scope: TrendScope = "area",
) =>
  useQuery<TrendQualityData>({
    queryKey: mondayMonitoringKeys.trendQuality(kind, metric, scope),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await getTrendQualityChart(kind, metric, scope, signal);

      const rawWeeks = response?.week ?? [];

      return {
        weeks: rawWeeks.map((item) => `W${item.week}`),
        weekInfo: rawWeeks.map((item) => {
          if (item.start && item.end) return `${item.start} s/d ${item.end}`;
          if (item.year) return String(item.year);
          return "";
        }),
        series: (response?.data ?? []).map((item) => ({
          name: item.name,
          data: item.data ?? [],
        })),
        unit: METRIC_UNIT[metric],
      };
    },
  });

const mapCtiRow = (row: CtiRawRow, index: number): CtiRow => ({
  no: index + 1,
  peTransit: row.transit ?? "-",
  bds: {
    baseline: parseHtmlNumber(row.bds_baseline),
    latency: parseHtmlNumber(row.bds_latency),
  },
  btc: {
    baseline: parseHtmlNumber(row.btc_baseline),
    latency: parseHtmlNumber(row.btc_latency),
  },
  pink: {
    baseline: parseHtmlNumber(row.pnk_baseline),
    latency: parseHtmlNumber(row.pnk_latency),
  },
});

export const useCtiMonitoringQuery = (enabled = true) =>
  useQuery<CtiRow[]>({
    queryKey: mondayMonitoringKeys.ctiMonitoring(),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const rows = await getCtiMonitoring(signal);
      return (Array.isArray(rows) ? rows : []).map(mapCtiRow);
    },
  });

export const useCtiTransitDetailQuery = (
  params: {
    transit: string;
    verifier: CtiVerifier;
    startDate: string;
    endDate: string;
  } | null,
) =>
  useQuery({
    queryKey: mondayMonitoringKeys.ctiTransitDetail(
      params?.transit ?? "",
      params?.verifier ?? "",
      `${params?.startDate ?? ""}_${params?.endDate ?? ""}`,
    ),
    enabled: Boolean(params?.transit),
    staleTime: 60 * 1000,
    queryFn: ({ signal }) =>
      getCtiTransitDetail(
        params as NonNullable<typeof params>,
        signal,
      ).then((rows) =>
        rows.map((row) => ({
          hour: String(row.hour_ ?? row.hour ?? "").slice(-2),
          label: String(row.hour_ ?? "-"),
          latency: Number(row.latency ?? 0),
          baseline: Number(row.baseline ?? 0),
          target: String(row.target ?? "-"),
          region: String(row.region ?? "-"),
        })),
      ),
  });
