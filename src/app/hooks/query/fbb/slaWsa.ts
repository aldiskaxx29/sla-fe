import { useQuery } from "@tanstack/react-query";

import { fbbKeys, getFbbSlaWsa, getFbbYearWeek } from "@/app/api";

import type {
  FbbYearWeekResponse,
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
