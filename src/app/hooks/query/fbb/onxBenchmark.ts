// React Query
import { useQuery } from "@tanstack/react-query";

// Api
import {
  fbbKeys,
  getFbbIndihomeTypeOptions,
  getFbbKpiOptions,
  getFbbLevelOptions,
  getFbbLoseRegionKabupaten,
  getFbbMapsRegionStatus,
  getFbbMetricsOptions,
  getFbbNationMetricsKpi,
  getFbbYearWeekOptions,
  type FbbLoseRegionParams,
  type FbbNationMetricsParams,
} from "@/app/api";

// Types
import type {
  FbbLoseRegionResponse,
  FbbMapRegionResponse,
  FbbNationMetricsResponse,
} from "@/app/types/fbb/onx.types";

const OPTION_STALE_TIME = 30 * 60 * 1000;
const DATA_STALE_TIME = 5 * 60 * 1000;

/** Satu hook per dropdown; isinya jarang berubah jadi cache-nya panjang. */
export const useFbbYearWeekOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("yearweek"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbYearWeekOptions(signal),
    select: (response) =>
      (response.data ?? []).map((item) => String(item.yearweek)),
  });

export const useFbbMetricsOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("metrics"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbMetricsOptions(signal),
    select: (response) => (response.data ?? []).map((item) => item.metrics),
  });

export const useFbbKpiOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("kpi"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbKpiOptions(signal),
    select: (response) => (response.data ?? []).map((item) => item.kpi),
  });

export const useFbbLevelOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("level"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbLevelOptions(signal),
    select: (response) => (response.data ?? []).map((item) => item.level),
  });

export const useFbbIndihomeTypeOptionsQuery = () =>
  useQuery({
    queryKey: fbbKeys.options("indihome-type"),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getFbbIndihomeTypeOptions(signal),
    select: (response) =>
      (response.data ?? []).map((item) => item.indihome_type),
  });

/** Tabel ringkasan metrics/KPI nasional. */
export const useFbbNationMetricsQuery = (
  params: FbbNationMetricsParams,
  enabled = true,
) =>
  useQuery<FbbNationMetricsResponse>({
    queryKey: fbbKeys.nationMetrics({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getFbbNationMetricsKpi(params, signal),
  });

/** Status per region untuk peta. */
export const useFbbMapRegionStatusQuery = (
  params: { yearweek?: string; indihomeType?: string; kpi?: string },
  enabled = true,
) =>
  useQuery<FbbMapRegionResponse>({
    queryKey: fbbKeys.mapRegionStatus({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getFbbMapsRegionStatus(params, signal),
  });

/** Detail per kabupaten, dipakai tab Detail. */
export const useFbbLoseRegionQuery = (
  params: FbbLoseRegionParams,
  enabled = true,
) =>
  useQuery<FbbLoseRegionResponse>({
    queryKey: fbbKeys.loseRegionKabupaten({ ...params }),
    enabled: enabled && Boolean(params.yearweek),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getFbbLoseRegionKabupaten(params, signal),
  });
