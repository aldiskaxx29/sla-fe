import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getPeHsiPivot,
  getPeHsiTrendSummary,
  getPeHsiTrendVerifier,
  networkKeys,
} from "@/app/api";

import type {
  PeHsiParams,
  PeHsiPivotArea,
  PeHsiTrendPoint,
  PeHsiVerifierParams,
  PeHsiVerifierTrend,
} from "@/app/types/network/peHsi.types";

const DATA_STALE_TIME = 5 * 60 * 1000;

export const usePeHsiPivotQuery = (params: PeHsiParams) =>
  useQuery({
    queryKey: networkKeys.peHsiPivot({ ...params }),
    enabled: Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiPivot(params, signal),
    select: (response): PeHsiPivotArea[] =>
      (Array.isArray(response) ? response : []).map((area) => ({
        ...area,
        items: area.items ?? [],
      })),
  });

export const usePeHsiTrendSummaryQuery = (params: PeHsiParams) =>
  useQuery({
    queryKey: networkKeys.peHsiTrend({ ...params }),
    enabled: Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiTrendSummary(params, signal),
    select: (response): PeHsiTrendPoint[] =>
      (response?.categories ?? []).map((label, index) => ({
        label,
        value: response?.series?.[index] ?? 0,
      })),
  });

export const usePeHsiTrendVerifierQuery = (
  params: PeHsiVerifierParams,
  enabled = true,
) =>
  useQuery({
    queryKey: networkKeys.peHsiTrendVerifier({ ...params }),
    enabled: enabled && Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiTrendVerifier(params, signal),
    select: (response): PeHsiVerifierTrend[] =>
      Array.isArray(response) ? response : [],
  });
