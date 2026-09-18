import { apiClient, apiRequest } from "@/app/api/base-url";

import type {
  MttrqReportResponse,
  ReportSiteDetailParams,
  ReportSiteDetailResponse,
  ReportSiteExportParams,
  ReportSiteParams,
  ReportSiteProfilingResponse,
} from "@/app/types/site/reportSite.types";

export const REPORT_SITE_ENDPOINTS = {
  profiling: "dashboard/siteProfilling",
  profilingDetail: "dashboard/detail/site/profilling",
  evidence: "rekonsiliasi/evidence",
} as const;

const MTTRQ_PARAMETERS = ["mttrq critical", "mttrq major", "mttrq minor"];

export const isMttrqParameter = (parameter: string) =>
  MTTRQ_PARAMETERS.includes(parameter) || parameter.includes("mttrq");

export const getReportSiteProfiling = (
  { parameter, week, month, year }: ReportSiteParams,
  signal?: AbortSignal,
) =>
  apiRequest<ReportSiteProfilingResponse>({
    method: "GET",
    url: REPORT_SITE_ENDPOINTS.profiling,
    params: { parameter, week, month, year },
    signal,
  });

export const getMttrqReport = (
  { parameter, week, month, year }: ReportSiteParams,
  signal?: AbortSignal,
) =>
  apiRequest<MttrqReportResponse>({
    method: "GET",
    url: REPORT_SITE_ENDPOINTS.profiling,
    params: { parameter, week, month, year },
    signal,
  });

export const getReportSiteDetail = (
  { region, statusSite, parameter, week, month, year }: ReportSiteDetailParams,
  signal?: AbortSignal,
) =>
  apiRequest<ReportSiteDetailResponse>({
    method: "GET",
    url: REPORT_SITE_ENDPOINTS.profilingDetail,
    params: {
      region,
      status_site: statusSite,
      parameter,
      week,
      month,
      year,
    },
    signal,
  });

export const downloadReportSiteEvidence = async ({
  parameter,
  week,
  month,
  year,
}: ReportSiteExportParams) => {
  const response = await apiClient.request<Blob>({
    method: "GET",
    url: REPORT_SITE_ENDPOINTS.evidence,
    params: {
      parameter,
      year,
      ...(isMttrqParameter(parameter) ? { month } : { week, month }),
    },
    responseType: "blob",
  });

  return response.data;
};
