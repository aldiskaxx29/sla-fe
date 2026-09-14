import { useQuery } from "@tanstack/react-query";

import { getOnxDetail, getOnxSummary, mondayMonitoringKeys } from "@/app/api";

import type {
  OnxDetailParams,
  OnxDetailResponse,
  OnxSummaryResponse,
} from "@/app/types/monday/onxMonitoring.types";

export const useOnxSummaryQuery = (enabled = true) =>
  useQuery<OnxSummaryResponse>({
    queryKey: mondayMonitoringKeys.onxSummary(),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => getOnxSummary(signal),
  });

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
