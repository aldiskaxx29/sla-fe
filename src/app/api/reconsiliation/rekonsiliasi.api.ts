// Api
import { apiClient, apiRequest } from "@/app/api/base-url";

// Types
import type {
  DownloadTemplateParams,
  ImportTemplatePayload,
  RekonsiliasiListParams,
  RekonsiliasiListResponse,
  YearWeekResponse,
} from "@/app/types/reconsiliation/rekonsiliasi.types";

export const REKONSILIASI_ENDPOINTS = {
  list: "dashboard/rekonsiliasi",
  yearWeek: "dashboard/rekonsiliasi/yearweek",
  detail: "dashboard/rekonsiliasi/detail",
  save: "dashboard/rekonsiliasi/save",
  import: "dashboard/rekonsiliasi/import",
  downloadTemplate: "rekonsiliasi/download-template",
  downloadEvidence: "download/evidence",
} as const;

/** `{ region_tsel: ["PUMA"] }` menjadi `{ "filter[region_tsel]": ["PUMA"] }`. */
const flattenFilter = (filter?: Record<string, string[]>) => {
  if (!filter) return {};

  return Object.entries(filter).reduce<Record<string, string[]>>(
    (result, [field, values]) => {
      if (values?.length) result[`filter[${field}]`] = values;
      return result;
    },
    {},
  );
};

export const buildRekonsiliasiListParams = ({
  prev,
  exclude,
  evidence,
  parameter,
  year,
  month,
  week,
  page,
  perPage,
  search,
  searchable,
  filter,
}: RekonsiliasiListParams) => ({
  prev,
  exclude,
  evidence,
  parameter,
  year,
  month,
  ...(week ? { week } : {}),
  page,
  per_page: perPage,
  ...(search ? { search } : {}),
  ...(searchable?.length ? { searchable } : {}),
  ...flattenFilter(filter),
});

export const getRekonsiliasiList = (
  params: RekonsiliasiListParams,
  signal?: AbortSignal,
) =>
  apiRequest<RekonsiliasiListResponse>({
    method: "GET",
    url: REKONSILIASI_ENDPOINTS.list,
    params: buildRekonsiliasiListParams(params),
    signal,
  });

/** Daftar tahun, bulan, dan minggu yang tersedia beserta periode aktifnya. */
export const getYearWeek = (signal?: AbortSignal) =>
  apiRequest<YearWeekResponse>({
    method: "GET",
    url: REKONSILIASI_ENDPOINTS.yearWeek,
    signal,
  });

/** Detail satu baris untuk mengisi form edit. */
export const getRekonsiliasiDetail = (
  params: { id: string | number; parameter: string; week?: string | number },
  signal?: AbortSignal,
) =>
  apiRequest<Record<string, unknown>>({
    method: "GET",
    url: REKONSILIASI_ENDPOINTS.detail,
    params,
    signal,
  });

export const saveRekonsiliasi = (body: FormData) =>
  apiRequest<{ status?: boolean; message?: string }>({
    method: "POST",
    url: REKONSILIASI_ENDPOINTS.save,
    data: body,
  });

export const importRekonsiliasiTemplate = ({
  file,
  parameter,
  month,
  week,
  exclude,
}: ImportTemplatePayload) => {
  const body = new FormData();
  body.append("file", file);

  return apiRequest<{ status?: boolean; message?: string }>({
    method: "POST",
    url: REKONSILIASI_ENDPOINTS.import,
    params: {
      exclude,
      parameter,
      month,
      ...(week ? { week } : {}),
    },
    data: body,
  });
};

export const downloadRekonsiliasiTemplate = async ({
  parameter,
  year,
  month,
  week,
  exclude,
  evidence,
}: DownloadTemplateParams) => {
  const response = await apiClient.request<Blob>({
    method: "GET",
    url: REKONSILIASI_ENDPOINTS.downloadTemplate,
    params: {
      exclude,
      evidence,
      parameter,
      year,
      month,
      ...(week ? { week } : {}),
    },
    responseType: "blob",
  });

  return response.data;
};

export const downloadEvidence = async (params: Record<string, string>) => {
  const response = await apiClient.request<Blob>({
    method: "GET",
    url: REKONSILIASI_ENDPOINTS.downloadEvidence,
    params,
    responseType: "blob",
  });

  return response.data;
};
