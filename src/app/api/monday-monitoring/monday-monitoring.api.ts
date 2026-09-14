import axios from "axios";

import { apiRequest } from "@/app/api/base-url";

import type {
  AccessPlTotal,
  CnopAccessRow,
  CoreSlaRow,
  CoreTransitRow,
  MsaAccessRow,
  MttrRegionRow,
  MttrTicketRow,
  SiteDetailRow,
  SlaPeriod,
  SlaRcaGroupingResponse,
} from "@/app/types/monday/slaPerformance.types";
import type {
  BaselineRegionRaw,
  BaselineTrendResponse,
} from "@/app/types/monday/baseline.types";
import type {
  OnxDetailParams,
  OnxDetailResponse,
  OnxSummaryResponse,
} from "@/app/types/monday/onxMonitoring.types";
import type {
  CtiRawRow,
  CtiTransitDetailResponse,
  CtiTransitDetailRow,
  CtiVerifier,
  MagistaRow,
  RpjMetric,
  TrendChartResponse,
  TrendKind,
  TrendMetric,
  TrendScope,
} from "@/app/types/monday/trendQuality.types";

const MONDAY_MONITORING_TOKEN =
  import.meta.env.VITE_MONDAY_MONITORING_TOKEN ||
  "4592|3321d8d4f1cc1768aa1ba79e27fb711aa8d4b5fd8d0ee6e7024fb14edfd36754";

export const resolveMondayMonitoringBaseUrl = (
  baseUrl: string | undefined = import.meta.env.VITE_MONDAY_MONITORING_BASE_URL,
): string => {
  if (baseUrl) return baseUrl;

  return import.meta.env.DEV ? "/qosmo/mondaymonitoring" : "/mondaymonitoring";
};

const mondayMonitoringClient = axios.create({
  baseURL: resolveMondayMonitoringBaseUrl(),
  headers: { Authorization: `Bearer ${MONDAY_MONITORING_TOKEN}` },
});

const weeklyMonitoringClient = axios.create({
  baseURL: import.meta.env.DEV ? "/qosmo/weeklymonitoring" : "/weeklymonitoring",
  headers: { Authorization: `Bearer ${MONDAY_MONITORING_TOKEN}` },
});

const getMondayMonitoringFile = async <TResponse>(
  path: string,
  signal?: AbortSignal,
): Promise<TResponse> => {
  const { data } = await mondayMonitoringClient.get<TResponse>("/api.php", {
    params: { a: "file", path },
    signal,
  });

  return data;
};

export const slaAssetPath = (rekon: "before" | "after", path: string) =>
  rekon === "after" ? `assets/sla/after/${path}` : `assets/sla/${path}`;

export const getMsaAccessSla = (
  rekon: "before" | "after",
  file: "packetloss5" | "packetloss15",
  signal?: AbortSignal,
) =>
  getMondayMonitoringFile<MsaAccessRow[]>(
    slaAssetPath(rekon, `msa/access/${file}.json`),
    signal,
  );

export const getCnopAccessSla = (
  rekon: "before" | "after",
  file: "latency" | "jitter",
  signal?: AbortSignal,
) =>
  getMondayMonitoringFile<CnopAccessRow[]>(
    slaAssetPath(rekon, `cnop/access/${file}.json`),
    signal,
  );

export const getMttrRegionSla = (
  rekon: "before" | "after",
  file: "regionMajor" | "regionMinor" | "regionCritical",
  period: SlaPeriod = "week",
  signal?: AbortSignal,
) =>
  getMondayMonitoringFile<MttrRegionRow[]>(
    period === "month" && file !== "regionCritical"
      ? `assets/sla/weekToDate/${file}.json`
      : slaAssetPath(rekon, `mttr/${file}.json`),
    signal,
  );

export const getSlaRcaGrouping = (signal?: AbortSignal) =>
  getMondayMonitoringFile<SlaRcaGroupingResponse>(
    "assets/data/resumGroupingRca.json",
    signal,
  );

export const getCoreSla = (
  file: "packetloss" | "jitter" | "latency_bds" | "latency_btc" | "latency_pnk",
  signal?: AbortSignal,
) => getMondayMonitoringFile<CoreSlaRow[]>(`assets/sla/core/${file}.json`, signal);

export const getAccessPacketLossTotals = async (
  yearWeek: string,
  signal?: AbortSignal,
): Promise<AccessPlTotal[]> => {
  const { data } = await mondayMonitoringClient.get<AccessPlTotal[]>(
    "/api.php",
    {
      params: {
        a: "accessPl",
        year: yearWeek.slice(0, 4),
        week: Number(yearWeek.slice(4)),
      },
      signal,
    },
  );

  return Array.isArray(data) ? data : [];
};

export const getTrendQualityChart = (
  kind: TrendKind,
  metric: TrendMetric,
  scope: TrendScope = "area",
  signal?: AbortSignal,
) =>
  getMondayMonitoringFile<TrendChartResponse>(
    kind === "core"
      ? `assets/chart/core/brix_cti_${scope}_${metric}.json`
      : `assets/chart/access/access_${scope}_${metric}.json`,
    signal,
  );

export const getCtiMonitoring = (signal?: AbortSignal) =>
  getMondayMonitoringFile<CtiRawRow[]>("assets/data/tesCti.json", signal);

export const getSiteDetailRegion = async (
  params: {
    region: string;
    level: "packetloss" | "latency" | "jitter";
    distributionPl?: string;
  },
  signal?: AbortSignal,
): Promise<SiteDetailRow[]> => {
  const { data } = await weeklyMonitoringClient.get<SiteDetailRow[] | string>(
    "/api.php",
    {
      params: {
        a: "siteDetailRegion",
        region: params.region,
        level: params.level,
        distribution_pl: params.distributionPl ?? "all",
        city: "",
      },
      signal,
    },
  );

  if (!Array.isArray(data)) {
    throw new Error(
      typeof data === "string" && data.trim()
        ? data.trim()
        : "Detail site tidak tersedia.",
    );
  }

  return data;
};

export const getMttrTickets = (signal?: AbortSignal) =>
  getMondayMonitoringFile<MttrTicketRow[]>(
    "assets/sla/mttr/all_reg_ttr.json",
    signal,
  );

export const getCoreTransitDetail = (signal?: AbortSignal) =>
  getMondayMonitoringFile<CoreTransitRow[]>(
    "assets/sla/core/detailCore.json",
    signal,
  );

const executiveClient = axios.create({
  baseURL: import.meta.env.DEV ? "/qosmo/executive" : "/executive",
});

export const getCtiTransitDetail = async (
  params: {
    transit: string;
    verifier: CtiVerifier;
    startDate: string;
    endDate: string;
  },
  signal?: AbortSignal,
): Promise<CtiTransitDetailRow[]> => {
  const { data } = await executiveClient.get<CtiTransitDetailResponse>(
    "/api/core/core.php",
    {
      params: {
        cmd: "pe-transit-cti-detail",
        date: params.startDate,
        hour: new Date().getHours(),
        verifier: params.verifier,
        transit: params.transit,
        type: "one",
        start_date: params.startDate,
        end_date: params.endDate,
      },
      signal,
    },
  );

  return data?.data?.[params.verifier] ?? [];
};

const RPJ_FILE: Record<RpjMetric, string> = {
  latency: "assets/data/magista_latency.json",
  packetloss: "assets/data/magista_pl.json",
  jitter: "assets/data/magista_jitter.json",
};

export const getRpjBenchmark = (metric: RpjMetric, signal?: AbortSignal) =>
  getMondayMonitoringFile<MagistaRow[]>(RPJ_FILE[metric], signal);

export const getBaselinePerformance = (signal?: AbortSignal) =>
  getMondayMonitoringFile<BaselineRegionRaw[]>(
    "assets/data/basedOnBaseline.json",
    signal,
  );

export const getBaselineTrend = (signal?: AbortSignal) =>
  getMondayMonitoringFile<BaselineTrendResponse>(
    "assets/data/chartBasedOnBaseline.json",
    signal,
  );

export const getOnxSummary = (signal?: AbortSignal) =>
  apiRequest<OnxSummaryResponse>({
    method: "GET",
    url: "monday-monitoring/onx/summary",
    signal,
  });

export const getOnxDetail = (
  { region, provider, code }: OnxDetailParams,
  signal?: AbortSignal,
) =>
  apiRequest<OnxDetailResponse>({
    method: "GET",
    url: "monday-monitoring/onx/detail",
    params: {
      ...(region ? { region } : {}),
      ...(provider ? { provider } : {}),
      ...(code ? { code } : {}),
    },
    signal,
  });
