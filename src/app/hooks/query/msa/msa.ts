import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import {
  getMsaAchievement,
  getMsaComply,
  getMsaHistory,
  getMsaRealisasi,
  getMsaSiteWeek,
  getMsaTrend,
  getMsaWeeklyDetail,
  msaKeys,
} from "@/app/api";

import type {
  MsaAchievementParams,
  MsaComplyItem,
  MsaHistoryParams,
  MsaRealisasiData,
  MsaRealisasiParams,
  MsaRow,
  MsaSiteWeekParams,
  MsaTrendData,
  MsaTrendParams,
  MsaWeeklyDetailParams,
} from "@/app/types/msa/msa.types";
import {
  addRowNumbers,
  mapMsaRows,
  mapWeeklyMonthRows,
  normalizeMsaMonthlyKeys,
  TREND_PARAMETERS,
} from "@/app/utils/msa.utils";

const DATA_STALE_TIME = 5 * 60 * 1000;
const OPTION_STALE_TIME = 30 * 60 * 1000;

const unwrapRows = (response: unknown): MsaRow[] => {
  if (Array.isArray(response)) return response as MsaRow[];

  const record = response as { data?: unknown } | null;

  if (Array.isArray(record?.data)) return record.data as MsaRow[];

  const nested = (record?.data as { data?: unknown } | undefined)?.data;

  return Array.isArray(nested) ? (nested as MsaRow[]) : [];
};

export const useMsaAchievementQuery = (params: MsaAchievementParams) =>
  useQuery({
    queryKey: msaKeys.achievement({ ...params }),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getMsaAchievement(params, signal),
    select: (response): MsaRow[] =>
      addRowNumbers(normalizeMsaMonthlyKeys(mapMsaRows(response?.data, "nation"))),
  });

/**
 * Bentuk response trend bisa `{ week, data }` atau terbungkus `data`, jadi
 * dinormalkan di sini supaya chart hanya menerima satu bentuk.
 */
const toTrendData = (response: unknown): MsaTrendData | null => {
  const candidates = [
    (response as { data?: unknown })?.data,
    response,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;

    const record = candidate as { week?: unknown; data?: unknown };
    const week = Array.isArray(record.week) ? (record.week as string[]) : [];
    const data = Array.isArray(record.data)
      ? (record.data as MsaTrendData["data"])
      : [];

    if (week.length && data.length) return { week, data };

    const nested = record.data as { week?: unknown; data?: unknown } | undefined;

    if (nested && typeof nested === "object") {
      const nestedWeek = Array.isArray(nested.week)
        ? (nested.week as string[])
        : [];
      const nestedData = Array.isArray(nested.data)
        ? (nested.data as MsaTrendData["data"])
        : [];

      if (nestedWeek.length && nestedData.length) {
        return { week: nestedWeek, data: nestedData };
      }
    }
  }

  return null;
};

/** Satu query per parameter trend, hasilnya dipetakan ke map per parameter. */
export const useMsaTrendQueries = (params: Omit<MsaTrendParams, "parameter">) =>
  useQueries({
    queries: TREND_PARAMETERS.map((parameter) => ({
      queryKey: msaKeys.trend({ ...params, parameter }),
      staleTime: DATA_STALE_TIME,
      placeholderData: keepPreviousData,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getMsaTrend({ ...params, parameter }, signal),
      select: (response: unknown) => toTrendData(response),
    })),
    combine: (results) => ({
      data: TREND_PARAMETERS.reduce<Record<string, MsaTrendData | null>>(
        (accumulator, parameter, index) => {
          accumulator[parameter] = results[index]?.data ?? null;

          return accumulator;
        },
        {},
      ),
      isFetching: results.some((result) => result.isFetching),
      isError: results.every((result) => result.isError),
    }),
  });

export const useMsaHistoryQuery = (params: MsaHistoryParams) =>
  useQuery({
    queryKey: msaKeys.history({ ...params }),
    enabled: Boolean(params.kpi),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getMsaHistory(params, signal),
    select: unwrapRows,
  });

export const useMsaComplyQuery = () =>
  useQuery({
    queryKey: msaKeys.comply(),
    staleTime: OPTION_STALE_TIME,
    queryFn: ({ signal }) => getMsaComply(signal),
    select: (response): MsaComplyItem[] =>
      unwrapRows(response) as unknown as MsaComplyItem[],
  });

export const useMsaWeeklyDetailQuery = (
  params: MsaWeeklyDetailParams | null,
) =>
  useQuery({
    queryKey: msaKeys.weeklyDetail({ ...params }),
    enabled: Boolean(params?.week),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getMsaWeeklyDetail(params!, signal),
    select: unwrapRows,
  });

export const useMsaRealisasiQuery = (params: MsaRealisasiParams | null) =>
  useQuery({
    queryKey: msaKeys.realisasi({ ...params }),
    enabled: Boolean(params?.kpi),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getMsaRealisasi(params!, signal),
    select: (response): MsaRealisasiData => ({
      before: mapWeeklyMonthRows(response?.data?.before),
      after: mapWeeklyMonthRows(response?.data?.after),
    }),
  });

export const useMsaSiteWeekQuery = (params: MsaSiteWeekParams | null) =>
  useQuery({
    queryKey: msaKeys.siteWeek({ ...params }),
    enabled: Boolean(params?.week),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getMsaSiteWeek(params!, signal),
    select: unwrapRows,
  });
