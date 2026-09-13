// Axios
import axios from "axios";

// Api
import { apiRequest } from "@/app/api/base-url";

// Types
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

/**
 * Monday Monitoring lama (PHP) yang datanya dipakai panel SLA Performance.
 * Endpoint-nya dijaga satu API key statis yang sama untuk semua pemakai —
 * token yang sama juga sudah ikut terkirim ke browser di halaman lamanya.
 * Bisa ditimpa lewat VITE_MONDAY_MONITORING_TOKEN.
 */
const MONDAY_MONITORING_TOKEN =
  import.meta.env.VITE_MONDAY_MONITORING_TOKEN ||
  "4592|3321d8d4f1cc1768aa1ba79e27fb711aa8d4b5fd8d0ee6e7024fb14edfd36754";

/**
 * Dev lewat proxy `/qosmo` (lihat `vite.config.ts`). Di server, aplikasi PHP
 * lama ini dilayani pada origin yang sama dengan SPA (`/mondaymonitoring`),
 * jadi dipakai path relatif — endpoint-nya tidak mengirim header CORS, jadi
 * URL absolut ke qosmo.telkom.co.id pasti diblokir browser saat aplikasi
 * diakses dari host lain (mis. http://10.60.174.187:8091).
 */
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

/** Semua data SLA disimpan sebagai file JSON statis di server lama. */
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

/** `assets/sla/...` untuk before rekon, `assets/sla/after/...` untuk after. */
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
    // Periode bulanan (month to date) hanya tersedia untuk major & minor, dan
    // hanya pada folder weekToDate (tidak punya varian after rekon).
    period === "month" && file !== "regionCritical"
      ? `assets/sla/weekToDate/${file}.json`
      : slaAssetPath(rekon, `mttr/${file}.json`),
    signal,
  );

/** Core belum punya varian after rekon di server lama, jadi selalu path dasar. */
export const getCoreSla = (
  file: "packetloss" | "jitter" | "latency_bds" | "latency_btc" | "latency_pnk",
  signal?: AbortSignal,
) => getMondayMonitoringFile<CoreSlaRow[]>(`assets/sla/core/${file}.json`, signal);

/** Jumlah site packet loss access per minggu; ini satu-satunya sumber per-minggu. */
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

/** Chart trend quality: `core` dari brix CTI, `access` dari pengukuran access. */
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

/** Tabel Monitoring CTI (snapshot per jam dari server lama). */
export const getCtiMonitoring = (signal?: AbortSignal) =>
  getMondayMonitoringFile<CtiRawRow[]>("assets/data/tesCti.json", signal);

/** Detail level-2 kartu access: daftar site not clear pada satu region. */
export const getSiteDetailRegion = async (
  params: {
    region: string;
    level: "packetloss" | "latency" | "jitter";
    distributionPl?: string;
  },
  signal?: AbortSignal,
): Promise<SiteDetailRow[]> => {
  const { data } = await mondayMonitoringClient.get<SiteDetailRow[] | string>(
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

  // Endpoint lama membalas 200 dengan pesan teks saat query-nya gagal.
  if (!Array.isArray(data)) {
    throw new Error(
      typeof data === "string" && data.trim()
        ? data.trim()
        : "Detail site tidak tersedia.",
    );
  }

  return data;
};

/** Detail level-2 kartu MTTR: seluruh tiket, difilter per region di klien. */
export const getMttrTickets = (signal?: AbortSignal) =>
  getMondayMonitoringFile<MttrTicketRow[]>(
    "assets/sla/mttr/all_reg_ttr.json",
    signal,
  );

/** Detail level-2 kartu core: nilai per transit/EBR. */
export const getCoreTransitDetail = (signal?: AbortSignal) =>
  getMondayMonitoringFile<CoreTransitRow[]>(
    "assets/sla/core/detailCore.json",
    signal,
  );

/**
 * Detail per jam satu PE transit (dipakai popup Monitoring CTI). Endpoint ini
 * ada di aplikasi `executive` pada host yang sama, tanpa token.
 */
const executiveClient = axios.create({
  // Sama seperti monday-monitoring: satu origin dengan SPA supaya bebas CORS.
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

/** Data RPJ CX (Winning Benchmark) per metrik dari magista. */
const RPJ_FILE: Record<RpjMetric, string> = {
  latency: "assets/data/magista_latency.json",
  packetloss: "assets/data/magista_pl.json",
  jitter: "assets/data/magista_jitter.json",
};

export const getRpjBenchmark = (metric: RpjMetric, signal?: AbortSignal) =>
  getMondayMonitoringFile<MagistaRow[]>(RPJ_FILE[metric], signal);

/** Baseline Performance: site not clear latency & packet loss per region. */
export const getBaselinePerformance = (signal?: AbortSignal) =>
  getMondayMonitoringFile<BaselineRegionRaw[]>(
    "assets/data/basedOnBaseline.json",
    signal,
  );

/** Tren mingguan baseline per region, dipakai popup saat region diklik. */
export const getBaselineTrend = (signal?: AbortSignal) =>
  getMondayMonitoringFile<BaselineTrendResponse>(
    "assets/data/chartBasedOnBaseline.json",
    signal,
  );

/**
 * Monitoring ONX dilayani API qosmo yang baru (bukan PHP lama), jadi memakai
 * `apiRequest` biasa: dev lewat proxy `/qosmo/api`, production ke host qosmo.
 */
export const getOnxSummary = (signal?: AbortSignal) =>
  apiRequest<OnxSummaryResponse>({
    method: "GET",
    url: "monday-monitoring/onx/summary",
    signal,
  });

/** Detail per IP. Tanpa `region` server mengirim seluruh region. */
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
