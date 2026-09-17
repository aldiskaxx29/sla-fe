import { apiRequest } from "@/app/api/base-url";

import type {
  PeHsiParams,
  PeHsiPivotResponse,
  PeHsiTrendResponse,
  PeHsiVerifierParams,
  PeHsiVerifierTrendResponse,
} from "@/app/types/network/peHsi.types";

export const PE_HSI_ENDPOINTS = {
  pivot: "pe-hsi/pivot",
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
  { peHsi, ...params }: PeHsiVerifierParams,
  signal?: AbortSignal,
) =>
  apiRequest<PeHsiVerifierTrendResponse>({
    method: "GET",
    url: PE_HSI_ENDPOINTS.trendVerifier,
    params: {
      ...toParams(params),
      ...(peHsi ? { pe_hsi: peHsi } : {}),
    },
    signal,
  });
