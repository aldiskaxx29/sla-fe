import { apiRequest } from "@/app/api/base-url";

import type {
  MsaAchievementParams,
  MsaComplyItem,
  MsaHistoryParams,
  MsaRealisasiParams,
  MsaRegionParams,
  MsaRow,
  MsaSiteWeekParams,
  MsaTrendParams,
  MsaWeeklyDetailParams,
  MsaWitelParams,
} from "@/app/types/msa/msa.types";
import {
  isMttrqParameter,
  isWilayahRow,
  mapParameterToKey,
  mapTregToArea,
  normalizeWilayah,
} from "@/app/utils/msa.utils";

export const MSA_ENDPOINTS = {
  nation: "achievement-wisa/not-comply/nation",
  region: "achievement-wisa/not-comply/region",
  witel: "achievement-wisa/not-comply/witel",
  weeklyMonth: "achievement-wisa/not-comply/weekly-month",
  trend: "dashboard/weekly/trend",
  history: "dashboard/history/weekly",
  comply: "dashboard/parameter/comply",
  siteNotClear: "detailsite/notclear",
  siteNotClearWeek: "dashboard/site/not-clear/week",
} as const;

interface ListResponse<TData> {
  data?: TData;
}

const currentYear = () => new Date().getFullYear();

export const getMsaAchievement = (
  { treg, year }: MsaAchievementParams,
  signal?: AbortSignal,
) =>
  apiRequest<ListResponse<unknown>>({
    method: "GET",
    url: MSA_ENDPOINTS.nation,
    params: { tahun: year ?? currentYear(), area: mapTregToArea(treg) },
    signal,
  });

export const getMsaRegion = (
  { treg, year, parameter }: MsaRegionParams,
  signal?: AbortSignal,
) =>
  apiRequest<ListResponse<unknown>>({
    method: "GET",
    url: MSA_ENDPOINTS.region,
    params: {
      tahun: year ?? currentYear(),
      parameter_key: mapParameterToKey(parameter),
      area: mapTregToArea(treg),
    },
    signal,
  });

/**
 * KPI MTTRQ punya level tambahan (wilayah Jawa/Non Jawa), jadi baris wilayah
 * justru mengambil daftar region, bukan witel.
 */
export const getMsaWitel = (
  { treg, year, parameter, region, wilayah }: MsaWitelParams,
  signal?: AbortSignal,
) => {
  const expandsWilayah = isMttrqParameter(parameter) && isWilayahRow(region);

  if (expandsWilayah) {
    return apiRequest<ListResponse<unknown>>({
      method: "GET",
      url: MSA_ENDPOINTS.region,
      params: {
        tahun: year ?? currentYear(),
        parameter_key: mapParameterToKey(parameter),
        area: mapTregToArea(treg),
      },
      signal,
    });
  }

  return apiRequest<ListResponse<unknown>>({
    method: "GET",
    url: MSA_ENDPOINTS.witel,
    params: {
      tahun: year ?? currentYear(),
      parameter_key: mapParameterToKey(parameter),
      region,
      area: mapTregToArea(treg),
      ...(isMttrqParameter(parameter)
        ? { wilayah: normalizeWilayah(wilayah) }
        : {}),
    },
    signal,
  });
};

export const getMsaTrend = (
  { level, parameter, treg }: MsaTrendParams,
  signal?: AbortSignal,
) =>
  apiRequest<unknown>({
    method: "GET",
    url: MSA_ENDPOINTS.trend,
    params: {
      type: "msa",
      level,
      parameter,
      ...(treg && treg !== "all" ? { treg } : {}),
    },
    signal,
  });

export const getMsaHistory = (
  { kpi, treg, filter, rekon, level, region, type = "msa" }: MsaHistoryParams,
  signal?: AbortSignal,
) =>
  apiRequest<unknown>({
    method: "GET",
    url: level ? `${MSA_ENDPOINTS.history}/${level}` : MSA_ENDPOINTS.history,
    params: {
      type,
      kpi,
      ...(treg && treg !== "all" ? { treg } : {}),
      ...(filter ? { filter } : {}),
      ...(rekon ? { rekon } : {}),
      ...(level ? { level } : {}),
      ...(region ? { region } : {}),
    },
    signal,
  });

export const getMsaComply = (signal?: AbortSignal) =>
  apiRequest<ListResponse<MsaComplyItem[]> | MsaComplyItem[]>({
    method: "GET",
    url: MSA_ENDPOINTS.comply,
    signal,
  });

export const getMsaWeeklyDetail = (
  { week, year, kpi, region }: MsaWeeklyDetailParams,
  signal?: AbortSignal,
) =>
  apiRequest<ListResponse<MsaRow[]> | MsaRow[]>({
    method: "GET",
    url: MSA_ENDPOINTS.siteNotClear,
    params: { week, year, kpi, region, type: "msa" },
    signal,
  });

export const getMsaRealisasi = (
  { kpi, monthNum, year }: MsaRealisasiParams,
  signal?: AbortSignal,
) =>
  apiRequest<ListResponse<{ before?: unknown; after?: unknown }>>({
    method: "GET",
    url: MSA_ENDPOINTS.weeklyMonth,
    params: {
      parameter_key: mapParameterToKey(kpi),
      tahun: year,
      bulan: monthNum,
    },
    signal,
  });

export const getMsaSiteWeek = (
  { year, week, type, status, region }: MsaSiteWeekParams,
  signal?: AbortSignal,
) =>
  apiRequest<ListResponse<MsaRow[]>>({
    method: "GET",
    url: MSA_ENDPOINTS.siteNotClearWeek,
    params: { year, week, type, status, ...(region ? { region } : {}) },
    signal,
  });
