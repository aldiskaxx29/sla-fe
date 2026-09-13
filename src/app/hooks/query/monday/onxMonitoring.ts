// React Query
import { useQuery } from "@tanstack/react-query";

// Api
import { getOnxDetail, getOnxSummary, mondayMonitoringKeys } from "@/app/api";

// Types
import type {
  OnxDetailParams,
  OnxDetailResponse,
  OnxSummaryResponse,
} from "@/app/types/monday/onxMonitoring.types";

/** Ringkasan jumlah IP per provider tiap region/code. */
export const useOnxSummaryQuery = (enabled = true) =>
  useQuery<OnxSummaryResponse>({
    queryKey: mondayMonitoringKeys.onxSummary(),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => getOnxSummary(signal),
  });

/** Detail per IP; hanya jalan setelah ada region yang dipilih. */
export const useOnxDetailQuery = (params: OnxDetailParams | null) =>
  useQuery<OnxDetailResponse>({
    queryKey: mondayMonitoringKeys.onxDetail(
      params?.region ?? "",
      params?.provider ?? "",
      params?.code ?? "",
    ),
    enabled: Boolean(params),
    staleTime: 60 * 1000,
    queryFn: ({ signal }) => getOnxDetail(params ?? {}, signal),
  });
