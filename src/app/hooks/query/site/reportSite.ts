import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import {
  downloadReportSiteEvidence,
  getMttrqReport,
  getReportSiteDetail,
  getReportSiteProfiling,
  isMttrqParameter,
  reportSiteKeys,
} from "@/app/api";

import type {
  MttrqReportData,
  MttrqReportResponse,
  MttrqResumeSlice,
  ReportSiteDetailParams,
  ReportSiteExportParams,
  ReportSiteParams,
  ReportSiteProfilingData,
  ReportSiteProfilingResponse,
} from "@/app/types/site/reportSite.types";

const STALE_TIME = 5 * 60 * 1000;

/** Warna & label tiap kategori issue MTTRQ pada pie resume. */
const RESUME_FIELDS: [string, string, string][] = [
  ["spms", "SPMS", "#2f5bd8"],
  ["isr", "ISR", "#f97316"],
  ["menunggu", "MENUNGGU TRANSPORTASI", "#10b981"],
  ["qe", "QE", "#06b6d4"],
  ["tsel", "ISSUE TSEL", "#f43f5e"],
  ["warranty", "WARRANTY", "#7c3aed"],
  ["comcase", "COMCASE", "#f59e0b"],
  ["ceragon", "CERAGON", "#8b5cf6"],
  ["waiting_cra_crq", "WAITING CRA / CRQ", "#ef4444"],
  ["issue_dws", "ISSUE DWS", "#14b8a6"],
  ["late_response", "LATE RESPONSE TIF / MITRA", "#374151"],
];

const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

/** Kunci chart dari backend masih bervariasi, jadi dicocokkan longgar. */
const toResume = (chart?: Record<string, number | string>): MttrqResumeSlice[] => {
  if (!chart || !Object.keys(chart).length) return [];

  const normalized = Object.entries(chart).reduce<Record<string, number>>(
    (result, [key, value]) => {
      result[normalizeKey(key)] = Number(value) || 0;
      return result;
    },
    {},
  );

  return RESUME_FIELDS.map(([key, label, color]) => {
    const desired = normalizeKey(key);
    const prefix = desired.slice(0, Math.min(5, desired.length));
    const match = Object.keys(normalized).find(
      (candidate) =>
        candidate.includes(desired) || (prefix && candidate.includes(prefix)),
    );

    return { label, value: match ? normalized[match] : 0, color };
  }).filter((slice) => slice.value > 0);
};

export const useReportSiteProfilingQuery = (params: ReportSiteParams) =>
  useQuery({
    queryKey: reportSiteKeys.profiling({ ...params }),
    enabled: !isMttrqParameter(params.parameter),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getReportSiteProfiling(params, signal),
    select: (response: ReportSiteProfilingResponse): ReportSiteProfilingData => ({
      rows: response?.data ?? [],
    }),
  });

export const useMttrqReportQuery = (params: ReportSiteParams) =>
  useQuery({
    queryKey: reportSiteKeys.mttrq({ ...params }),
    enabled: isMttrqParameter(params.parameter),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getMttrqReport(params, signal),
    select: (response: MttrqReportResponse): MttrqReportData => {
      const payload = response?.data ?? {};

      return {
        resume: toResume(payload.chart),
        detailRows: (payload.data as Record<string, unknown>[]) ?? [],
        actionPlan:
          (payload.action_plan as Record<string, unknown>[]) ??
          (payload.actionPlan as Record<string, unknown>[]) ??
          [],
      };
    },
  });

export const useReportSiteDetailQuery = (
  params: ReportSiteDetailParams | null,
) =>
  useQuery({
    queryKey: reportSiteKeys.detail({ ...(params ?? {}) }),
    enabled: Boolean(params),
    staleTime: STALE_TIME,
    queryFn: ({ signal }) =>
      getReportSiteDetail(params as ReportSiteDetailParams, signal),
    select: (response) => response?.data ?? [],
  });

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export const useDownloadReportSiteEvidenceMutation = () =>
  useMutation({
    mutationFn: (params: ReportSiteExportParams) =>
      downloadReportSiteEvidence(params),
    onSuccess: (blob, variables) => {
      const isMttrFile =
        variables.parameter.includes("mttrq major") ||
        variables.parameter.includes("mttrq minor");

      triggerBlobDownload(
        blob,
        isMttrFile ? "rekonsiliasi-mttr.xlsx" : "rekonsiliasi-access.xlsx",
      );
    },
  });
