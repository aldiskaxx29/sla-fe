// React Query
import { useQuery } from "@tanstack/react-query";

// Api
import { fbbKeys, getFbbSlaWsa, getFbbYearWeek } from "@/app/api";

// Types
import type {
  FbbYearWeekResponse,
  SlaWsaResponse,
} from "@/app/types/fbb/sla.types";

/** Daftar minggu untuk filter, sekalian minggu aktif dari server. */
export const useFbbYearWeekQuery = () =>
  useQuery<FbbYearWeekResponse>({
    queryKey: fbbKeys.yearWeek(),
    staleTime: 10 * 60 * 1000,
    queryFn: ({ signal }) => getFbbYearWeek(signal),
  });

/** Indikator SLA WISA FBB; baru jalan setelah minggunya diketahui. */
export const useFbbSlaWsaQuery = (yearweek: string | null) =>
  useQuery<SlaWsaResponse>({
    queryKey: fbbKeys.slaWsa(yearweek),
    enabled: Boolean(yearweek),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => getFbbSlaWsa(yearweek, signal),
  });
