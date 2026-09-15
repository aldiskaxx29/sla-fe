import { apiRequest } from "@/app/api/base-url";

import type {
  HistorySlaHighlightSummaryResponse,
  HistorySlaTableParams,
  HistorySlaTableResponse,
  HistorySlaTrendResponse,
} from "@/app/types/first-insight/historySla.types";

export const FIRST_INSIGHT_ENDPOINTS = {
  highlightSummary: "first-insight/highlight-summary",
  trendKpiNotClear: "first-insight/trend-kpi-not-clear",
  table: "first-insight/table",
} as const;

export const getHistorySlaHighlightSummary = (signal?: AbortSignal) =>
  apiRequest<HistorySlaHighlightSummaryResponse>({
    method: "GET",
    url: FIRST_INSIGHT_ENDPOINTS.highlightSummary,
    signal,
  });

export const getHistorySlaTrend = (signal?: AbortSignal) =>
  apiRequest<HistorySlaTrendResponse>({
    method: "GET",
    url: FIRST_INSIGHT_ENDPOINTS.trendKpiNotClear,
    signal,
  });

export const getHistorySlaTable = (
  { kpiCategory, search, page, perPage }: HistorySlaTableParams,
  signal?: AbortSignal,
) =>
  apiRequest<HistorySlaTableResponse>({
    method: "GET",
    url: FIRST_INSIGHT_ENDPOINTS.table,
    params: {
      ...(kpiCategory ? { kpi_category: kpiCategory } : {}),
      ...(search ? { search } : {}),
      page: page ?? 1,
      per_page: perPage ?? 10,
    },
    signal,
  });
