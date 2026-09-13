// Api
import { apiRequest } from "@/app/api/base-url";

// Types
import type {
  FbbYearWeekResponse,
  SlaWsaResponse,
} from "@/app/types/fbb/sla.types";
import type {
  FbbOoklaMapResponse,
  FbbOoklaMetricsResponse,
  FbbIndihomeTypeOption,
  FbbKpiOption,
  FbbLevelOption,
  FbbListResponse,
  FbbLoseRegionResponse,
  FbbMapRegionResponse,
  FbbMetricsOption,
  FbbNationMetricsResponse,
  FbbYearWeekOption,
} from "@/app/types/fbb/onx.types";

export const FBB_ENDPOINTS = {
  slaWsa: "fbb/sla/wsa",
  yearWeek: "onx-dashboard/yearweek",
  listYearWeek: "fbb/list-yearweek",
  listMetrics: "fbb/list-metrics",
  listKpi: "fbb/list-kpi",
  listLevel: "fbb/list-level",
  listIndihomeType: "fbb/list-indihome-type",
  nationMetricsKpi: "fbb/onx/nation-metrics-kpi",
  ooklaListMetrics: "fbb/ookla/list-metrics",
  ooklaListKpi: "fbb/ookla/list-kpi",
  ooklaListIndihomeType: "fbb/ookla/list-indihome-type",
  ooklaNationMetricsKpi: "fbb/ookla/nation-metrics-kpi",
  ooklaMapsRegionStatus: "fbb/ookla/maps-region-status",
  ooklaLoseRegionKabupaten: "fbb/ookla/lose-region-kabupaten",
  mapsRegionStatus: "fbb/onx/maps-region-status",
  loseRegionKabupaten: "fbb/onx/lose-region-kabupaten",
} as const;

/** Indikator SLA WISA FBB pada satu yearweek, mis. "202635". */
export const getFbbSlaWsa = (yearweek?: string | null, signal?: AbortSignal) =>
  apiRequest<SlaWsaResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.slaWsa,
    params: yearweek ? { "filter[yearweek]": yearweek } : {},
    signal,
  });

/** Daftar minggu yang datanya tersedia, plus minggu aktif. */
export const getFbbYearWeek = (signal?: AbortSignal) =>
  apiRequest<FbbYearWeekResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.yearWeek,
    signal,
  });

/* ------------------------------------------------------------------ *
 * ONX benchmark (halaman /fbb/onx)
 * ------------------------------------------------------------------ */

const getFbbList = <TItem>(url: string, signal?: AbortSignal) =>
  apiRequest<FbbListResponse<TItem>>({ method: "GET", url, signal });

export const getFbbYearWeekOptions = (signal?: AbortSignal) =>
  getFbbList<FbbYearWeekOption>(FBB_ENDPOINTS.listYearWeek, signal);

export const getFbbMetricsOptions = (signal?: AbortSignal) =>
  getFbbList<FbbMetricsOption>(FBB_ENDPOINTS.listMetrics, signal);

export const getFbbKpiOptions = (signal?: AbortSignal) =>
  getFbbList<FbbKpiOption>(FBB_ENDPOINTS.listKpi, signal);

export const getFbbLevelOptions = (signal?: AbortSignal) =>
  getFbbList<FbbLevelOption>(FBB_ENDPOINTS.listLevel, signal);

export const getFbbIndihomeTypeOptions = (signal?: AbortSignal) =>
  getFbbList<FbbIndihomeTypeOption>(FBB_ENDPOINTS.listIndihomeType, signal);

export interface FbbNationMetricsParams {
  yearweek?: string;
  level?: string;
  indihomeType?: string;
  metrics?: string;
  kpi?: string;
  page?: number;
  perPage?: number;
}

/** Ringkasan menang/kalah per metrics & KPI di tingkat nasional. */
export const getFbbNationMetricsKpi = (
  { yearweek, level, indihomeType, metrics, kpi, page, perPage }: FbbNationMetricsParams,
  signal?: AbortSignal,
) =>
  apiRequest<FbbNationMetricsResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.nationMetricsKpi,
    params: {
      ...(yearweek ? { yearweek } : {}),
      ...(level ? { level } : {}),
      ...(indihomeType ? { indihome_type: indihomeType } : {}),
      ...(metrics ? { metrics } : {}),
      ...(kpi ? { kpi } : {}),
      page: page ?? 1,
      per_page: perPage ?? 5,
    },
    signal,
  });

/** Status menang/total tiap region, dipakai mewarnai peta. */
export const getFbbMapsRegionStatus = (
  params: { yearweek?: string; indihomeType?: string; kpi?: string },
  signal?: AbortSignal,
) =>
  apiRequest<FbbMapRegionResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.mapsRegionStatus,
    params: {
      ...(params.yearweek ? { yearweek: params.yearweek } : {}),
      ...(params.indihomeType ? { indihome_type: params.indihomeType } : {}),
      ...(params.kpi ? { kpi: params.kpi } : {}),
    },
    signal,
  });

export interface FbbLoseRegionParams extends FbbNationMetricsParams {
  /** Nama region/kabupaten yang sedang dibuka detailnya. */
  areaName?: string;
}

/** Detail per kabupaten beserta deret trend-nya. */
export const getFbbLoseRegionKabupaten = (
  { yearweek, level, indihomeType, areaName, kpi, page, perPage }: FbbLoseRegionParams,
  signal?: AbortSignal,
) =>
  apiRequest<FbbLoseRegionResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.loseRegionKabupaten,
    params: {
      ...(yearweek ? { yearweek } : {}),
      ...(level ? { level } : {}),
      ...(indihomeType ? { indihome_type: indihomeType } : {}),
      ...(areaName ? { area_name: areaName } : {}),
      ...(kpi ? { kpi } : {}),
      page: page ?? 1,
      per_page: perPage ?? 5,
    },
    signal,
  });

/* ------------------------------------------------------------------ *
 * Ookla (halaman /fbb/ookla)
 * ------------------------------------------------------------------ */

export const getFbbOoklaMetricsOptions = (signal?: AbortSignal) =>
  getFbbList<FbbMetricsOption>(FBB_ENDPOINTS.ooklaListMetrics, signal);

/** Daftar KPI Ookla tergantung metrics yang dipilih. */
export const getFbbOoklaKpiOptions = (metrics?: string, signal?: AbortSignal) =>
  apiRequest<FbbListResponse<FbbKpiOption>>({
    method: "GET",
    url: FBB_ENDPOINTS.ooklaListKpi,
    params: metrics ? { metrics } : {},
    signal,
  });

export const getFbbOoklaIndihomeTypeOptions = (signal?: AbortSignal) =>
  getFbbList<FbbIndihomeTypeOption>(
    FBB_ENDPOINTS.ooklaListIndihomeType,
    signal,
  );

export interface FbbOoklaMetricsParams {
  yearweek?: string;
  indihomeType?: string;
  metrics?: string;
  kpi?: string;
  page?: number;
  perPage?: number;
}

export const getFbbOoklaNationMetrics = (
  { yearweek, indihomeType, metrics, kpi, page, perPage }: FbbOoklaMetricsParams,
  signal?: AbortSignal,
) =>
  apiRequest<FbbOoklaMetricsResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.ooklaNationMetricsKpi,
    params: {
      ...(yearweek ? { yearweek } : {}),
      ...(indihomeType ? { indihome_type: indihomeType } : {}),
      ...(metrics ? { metrics } : {}),
      ...(kpi ? { kpi } : {}),
      page: page ?? 1,
      per_page: perPage ?? 10,
    },
    signal,
  });

/** Status per region untuk peta Ookla; semua region diambil sekali jalan. */
export const getFbbOoklaMapsRegionStatus = (
  { yearweek, indihomeType, metrics, kpi, perPage }: FbbOoklaMetricsParams,
  signal?: AbortSignal,
) =>
  apiRequest<FbbOoklaMapResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.ooklaMapsRegionStatus,
    params: {
      ...(yearweek ? { yearweek } : {}),
      ...(indihomeType ? { indihome_type: indihomeType } : {}),
      ...(metrics ? { metrics } : {}),
      ...(kpi ? { kpi } : {}),
      page: 1,
      per_page: perPage ?? 100,
    },
    signal,
  });

export interface FbbOoklaLoseRegionParams {
  yearweek?: string;
  indihomeType?: string;
  metrics?: string;
  kpi?: string;
  level?: string;
  areaName?: string;
  page?: number;
  perPage?: number;
}

/** Detail per kabupaten pada halaman Ookla beserta deret trend-nya. */
export const getFbbOoklaLoseRegionKabupaten = (
  {
    yearweek,
    indihomeType,
    metrics,
    kpi,
    level = "KABUPATEN",
    areaName,
    page,
    perPage,
  }: FbbOoklaLoseRegionParams,
  signal?: AbortSignal,
) =>
  apiRequest<FbbLoseRegionResponse>({
    method: "GET",
    url: FBB_ENDPOINTS.ooklaLoseRegionKabupaten,
    params: {
      ...(yearweek ? { yearweek } : {}),
      ...(indihomeType ? { indihome_type: indihomeType } : {}),
      ...(metrics ? { metrics } : {}),
      ...(kpi ? { kpi } : {}),
      ...(level ? { level } : {}),
      ...(areaName ? { area_name: areaName } : {}),
      page: page ?? 1,
      per_page: perPage ?? 10,
    },
    signal,
  });

