import { useQuery } from "@tanstack/react-query";

import {
  fbbKeys,
  getFbbOoklaLoseRegion,
  getFbbOoklaLoseRegionKabupaten,
  getFbbOoklaMapsRegionStatus,
  getFbbOoklaIndihomeTypeOptions,
  getFbbOoklaKpiOptions,
  getFbbOoklaMetricsOptions,
  getFbbOoklaNationMetrics,
  type FbbOoklaLoseRegionParams,
  type FbbOoklaMetricsParams,
} from "@/app/api";

import type {
  FbbLoseRegionResponse,
  FbbMapRegionRow,
  FbbNationMetricRow,
  FbbOnxMeta,
  FbbOoklaMapRow,
  FbbOoklaMetricRow,
} from "@/app/types/fbb/onx.types";

const OPTION_STALE_TIME = 30 * 60 * 1000;
const DATA_STALE_TIME = 5 * 60 * 1000;

export const useFbbOoklaMetricsOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("ookla-metrics"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbOoklaMetricsOptions(signal),
    select: (response) => (response.data ?? []).map((item) => item.metrics),
  });

export const useFbbOoklaKpiOptionsQuery = (metrics: string) =>
  useQuery({
    queryKey: fbbKeys.options(`ookla-kpi:${metrics}`),
    enabled: Boolean(metrics),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbOoklaKpiOptions(metrics, signal),
    select: (response) => (response.data ?? []).map((item) => item.kpi),
  });

export const useFbbOoklaIndihomeTypeOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("ookla-indihome-type"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbOoklaIndihomeTypeOptions(signal),
    select: (response) =>
      (response.data ?? []).map((item) => item.indihome_type),
  });

const toStatusLabel = (benchmark?: string) => {
  const value = String(benchmark ?? "").toLowerCase();
  if (!value) return "-";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const toSharedRow = (row: FbbOoklaMetricRow): FbbNationMetricRow => ({
  metrics: row.metrics_result,
  kpi: row.kpi_result,
  status: toStatusLabel(row.benchmark),
  winner: row.winner,
  gap_to_winner: row.gap_to_winner,
  nearest_comp: "",
  gap_to_nearest_comp: row.gap_to_nearest,
  rank: row.provider_rank,
});

export interface FbbOoklaMetricsData {
  rows: FbbNationMetricRow[];
  meta?: FbbOnxMeta;
}

export const useFbbOoklaNationMetricsQuery = (
  params: FbbOoklaMetricsParams,
  enabled = true,
) =>
  useQuery<FbbOoklaMetricsData>({
    queryKey: fbbKeys.ooklaNationMetrics({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: async ({ signal }) => {
      const response = await getFbbOoklaNationMetrics(params, signal);

      return {
        rows: (response.data ?? []).map(toSharedRow),
        meta: response.meta,
      };
    },
  });

const toMapRow = (row: FbbOoklaMapRow): FbbMapRegionRow => ({
  regions: row.region,
  winner: row.winner,
  benchmark: row.benchmark,
  lose_per_total: row.status,
});

export const useFbbOoklaMapRegionStatusQuery = (
  params: FbbOoklaMetricsParams,
  enabled = true,
) =>
  useQuery<FbbMapRegionRow[]>({
    queryKey: fbbKeys.ooklaMapRegionStatus({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: async ({ signal }) => {
      const response = await getFbbOoklaMapsRegionStatus(params, signal);

      return (response.data ?? []).map(toMapRow);
    },
  });

export const useFbbOoklaLoseRegionSummaryQuery = (
  params: FbbOoklaLoseRegionParams,
  enabled = true,
) =>
  useQuery<FbbLoseRegionResponse>({
    queryKey: fbbKeys.ooklaLoseRegion({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getFbbOoklaLoseRegion(params, signal),
  });

export const useFbbOoklaLoseRegionQuery = (
  params: FbbOoklaLoseRegionParams,
  enabled = true,
) =>
  useQuery<FbbLoseRegionResponse>({
    queryKey: fbbKeys.ooklaLoseRegionKabupaten({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getFbbOoklaLoseRegionKabupaten(params, signal),
  });
