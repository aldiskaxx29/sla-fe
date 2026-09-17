import { apiRequest } from "@/app/api/base-url";

import type {
  PeHsiDateTimeResponse,
  PeHsiListPeResponse,
  PeHsiParams,
  PeHsiPerformanceLinkResponse,
  PeHsiPivotResponse,
  PeHsiTrendResponse,
  PeHsiVerifierParams,
  PeHsiVerifierTrendResponse,
} from "@/app/types/network/peHsi.types";

export const PE_HSI_ENDPOINTS = {
  pivot: "pe-hsi/pivot",
  performanceLink: "pe-hsi/performance-link",
  dateTime: "pe-hsi/date-time",
  listPe: "pe-hsi/list-pe",
  trendSummary: "pe-hsi/trend-summary",
  trendVerifier: "pe-hsi/trend-verifier",
} as const;

const toParams = ({ date, hour }: PeHsiParams) => ({
  ...(date ? { date } : {}),
  ...(hour === undefined || hour === null ? {} : { hour }),
});

export const getPeHsiPivot = (params: PeHsiParams, signal?: AbortSignal) =>
  apiRequest<PeHsiPivotResponse>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.pivot,
    params: toParams(params),
    signal,
  });

export const getPeHsiPerformanceLink = (
  params: PeHsiParams,
  signal?: AbortSignal,
) =>
  apiRequest<PeHsiPerformanceLinkResponse>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.performanceLink,
    params: toParams(params),
    signal,
  });

export const getPeHsiDateTime = (signal?: AbortSignal) =>
  apiRequest<PeHsiDateTimeResponse[]>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.dateTime,
    signal,
  });

export const getPeHsiListPe = (signal?: AbortSignal) =>
  apiRequest<PeHsiListPeResponse[]>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.listPe,
    signal,
  });

export const getPeHsiTrendSummary = (
  params: PeHsiParams,
  signal?: AbortSignal,
) =>
  apiRequest<PeHsiTrendResponse>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.trendSummary,
    params: toParams(params),
    signal,
  });

export const getPeHsiTrendVerifier = (
  { peHsi, filter, ...params }: PeHsiVerifierParams,
  signal?: AbortSignal,
) =>
  apiRequest<PeHsiVerifierTrendResponse>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.trendVerifier,
    params: {
      ...(filter ? { filter } : toParams(params)),
      ...(peHsi ? { pe_hsi: peHsi } : {}),
    },
    signal,
  });
