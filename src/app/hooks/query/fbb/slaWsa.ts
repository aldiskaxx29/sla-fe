import { useQuery } from "@tanstack/react-query";

import {
  fbbKeys,
  getFbbSlaKabupaten,
  getFbbSlaRegion,
  getFbbSlaWsa,
  getFbbYearWeek,
} from "@/app/api";

import type {
  FbbYearWeekResponse,
  SlaWsaDetailParams,
  SlaWsaDetailResponse,
  SlaWsaResponse,
} from "@/app/types/fbb/sla.types";

export const useFbbYearWeekQuery = () =>
  useQuery<FbbYearWeekResponse>({
    queryKey: fbbKeys.yearWeek(),
    staleTime: 10 * 60 * 1000,
    queryFn: ({ signal }) => getFbbYearWeek(signal),
  });

export const useFbbSlaWsaQuery = (yearweek: string | null) =>
  useQuery<SlaWsaResponse>({
    queryKey: fbbKeys.slaWsa(yearweek),
    enabled: Boolean(yearweek),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => getFbbSlaWsa(yearweek, signal),
  });

const DETAIL_STALE_TIME = 5 * 60 * 1000;

export const useFbbSlaRegionQuery = (
  params: SlaWsaDetailParams,
  enabled = true,
) =>
  useQuery<SlaWsaDetailResponse>({
    queryKey: fbbKeys.slaWsaRegion({ ...params }),
    enabled: enabled && Boolean(params.yearweek && params.parameter),
    staleTime: DETAIL_STALE_TIME,
    queryFn: ({ signal }) => getFbbSlaRegion(params, signal),
  });

export const useFbbSlaKabupatenQuery = (
  params: SlaWsaDetailParams,
  enabled = true,
) =>
  useQuery<SlaWsaDetailResponse>({
    queryKey: fbbKeys.slaWsaKabupaten({ ...params }),
    enabled: enabled && Boolean(params.yearweek && params.parameter && params.region),
    staleTime: DETAIL_STALE_TIME,
    queryFn: ({ signal }) => getFbbSlaKabupaten(params, signal),
  });
