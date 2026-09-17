import { apiClient, apiRequest } from "@/app/api/base-url";

import type {
  DailyMonitoringDownloadFile,
  DailyMonitoringDownloadParams,
  DailyMonitoringPacketLossDetailResponse,
  DailyMonitoringPacketLossResponse,
  DailyMonitoringSiteParams,
  DailyMonitoringSiteRow,
  DailyMonitoringSummaryResponse,
  PacketLossDetailKey,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";

export const DAILY_MONITORING_ENDPOINTS = {
  packetLoss: "daily-monitoring/pl-quality-cnop",
  packetLossDetail: "daily-monitoring/pl-quality-cnop/detail",
  packetLossSites: "daily-monitoring/pl-quality-cnop/sites",
  packetLossDownload: "daily-monitoring/pl-quality-cnop/download",
} as const;

/**
 * Data MTTRq masih dilayani service PHP terpisah (bukan `/api` utama), jadi
 * base URL-nya diambil dari env dan saat dev dilewatkan proxy vite.
 */
const SUMMARY_BASE_URL =
  import.meta.env.VITE_DAILY_MONITORING_API_BASE_URL || "/daily-monitoring-api";

const SUMMARY_URL = `${SUMMARY_BASE_URL}/api_summary_monitor.php`;

export const getDailyMonitoringSummary = async (
  signal?: AbortSignal,
): Promise<DailyMonitoringSummaryResponse> => {
  const token =
    import.meta.env.VITE_DAILY_MONITORING_TOKEN ||
    localStorage.getItem("access_token");

  const response = await fetch(SUMMARY_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as DailyMonitoringSummaryResponse;
};

export const getDailyMonitoringPacketLoss = (signal?: AbortSignal) =>
  apiRequest<DailyMonitoringPacketLossResponse>({
    method: "GET",
    url: DAILY_MONITORING_ENDPOINTS.packetLoss,
    signal,
  });

export const getDailyMonitoringPacketLossDetail = (
  pl: PacketLossDetailKey,
  signal?: AbortSignal,
) =>
  apiRequest<DailyMonitoringPacketLossDetailResponse>({
    method: "GET",
    url: DAILY_MONITORING_ENDPOINTS.packetLossDetail,
    params: { pl },
    signal,
  });

/** Region dikirim lowercase, area memakai nomor baris apa adanya. */
const toQueryValue = ({ type, value }: DailyMonitoringSiteParams) =>
  type === "region" ? value.toLowerCase() : value;

export const getDailyMonitoringSites = async (
  params: DailyMonitoringSiteParams,
  signal?: AbortSignal,
): Promise<DailyMonitoringSiteRow[]> => {
  const response = await apiRequest<
    DailyMonitoringSiteRow[] | { data?: DailyMonitoringSiteRow[] }
  >({
    method: "GET",
    url: DAILY_MONITORING_ENDPOINTS.packetLossSites,
    params: {
      type: params.type,
      value: toQueryValue(params),
      ...(params.pl ? { pl: params.pl } : {}),
    },
    signal,
  });

  if (Array.isArray(response)) return response;

  return response?.data ?? [];
};

const parseFileName = (disposition?: string) => {
  if (!disposition) return "";

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  return disposition.match(/filename="?([^"]+)"?/i)?.[1] ?? "";
};

export const downloadDailyMonitoringPacketLoss = async ({
  type,
  value,
  pl,
}: DailyMonitoringDownloadParams): Promise<DailyMonitoringDownloadFile> => {
  const response = await apiClient.request<Blob>({
    method: "GET",
    url: DAILY_MONITORING_ENDPOINTS.packetLossDownload,
    params: {
      ...(type && value
        ? { type, value: toQueryValue({ type, value }) }
        : {}),
      ...(pl ? { pl } : {}),
    },
    responseType: "blob",
  });

  return {
    blob: response.data,
    fileName:
      parseFileName(response.headers?.["content-disposition"] as string) ||
      "packet-loss-download.xlsx",
  };
};
