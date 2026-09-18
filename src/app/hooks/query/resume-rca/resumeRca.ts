import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import {
  getActionPlan,
  getLastWeek,
  getMttrResume,
  getRcaNotClearChart,
  getRcaNotClearDetail,
  getRcaTicketDetail,
  getTopOldestTickets,
  getTrafficChart,
  getTrafficNationalTotal,
  getTrafficTable,
  resumeRcaKeys,
  uploadReconProgress,
} from "@/app/api";

import type {
  ActionPlanData,
  ActionPlanResponse,
  LastWeekData,
  LastWeekResponse,
  MttrResumeData,
  MttrResumeResponse,
  RcaNotClearChartResponse,
  RcaNotClearDetailResponse,
  RcaNotClearTableData,
  ResumeRcaMttrParams,
  ResumeRcaTrafficParams,
  TrafficChartData,
  TrafficChartResponse,
  TrafficTableData,
  TrafficTableResponse,
} from "@/app/types/resume-rca/resumeRca.types";
import {
  RCA_MTTR_REGIONS,
  RCA_NOT_CLEAR_CHART_KEYS,
} from "@/app/utils/resumeRca.utils";

const STALE_TIME = 5 * 60 * 1000;

export const useLastWeekQuery = (isMttr: boolean) =>
  useQuery({
    queryKey: resumeRcaKeys.lastWeek(isMttr),
    staleTime: STALE_TIME,
    queryFn: ({ signal }) => getLastWeek(isMttr, signal),
    select: (response: LastWeekResponse): LastWeekData => ({
      maxWeek: Number(response?.data?.max_week ?? 0),
      maxYear: Number(response?.data?.max_year ?? 0),
      maxMonth: Number(response?.data?.max_month ?? 0),
    }),
  });

export const useTrafficNationalQuery = (params: ResumeRcaTrafficParams) =>
  useQuery({
    queryKey: resumeRcaKeys.nationalTotal({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getTrafficNationalTotal(params, signal),
  });

export const useTrafficChartQuery = (params: ResumeRcaTrafficParams) =>
  useQuery({
    queryKey: resumeRcaKeys.trafficChart({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getTrafficChart(params, signal),
    select: (response: TrafficChartResponse): TrafficChartData => {
      const source = response?.data ?? {};
      const labels = Object.keys(source);

      /** "Blank" selalu ditaruh paling akhir supaya urutan chart konsisten. */
      const blankIndex = labels.indexOf("Blank");
      if (blankIndex !== -1) {
        labels.splice(blankIndex, 1);
        labels.push("Blank");
      }

      return {
        labels,
        ogp: labels.map((label) => Number(source[label]?.OGP ?? 0)),
        closed: labels.map((label) => Number(source[label]?.CLOSED ?? 0)),
      };
    },
  });

export const useTrafficTableQuery = (params: ResumeRcaTrafficParams) =>
  useQuery({
    queryKey: resumeRcaKeys.trafficTable({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getTrafficTable(params, signal),
    select: (response: TrafficTableResponse): TrafficTableData => ({
      progress: response?.data?.progress ?? {},
      sites: response?.data?.site_not_clear ?? {},
    }),
  });

export const useActionPlanQuery = (params: ResumeRcaTrafficParams) =>
  useQuery({
    queryKey: resumeRcaKeys.actionPlan({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getActionPlan(params, signal),
    select: (response: ActionPlanResponse): ActionPlanData => {
      const source = { ...(response?.data ?? {}) };

      /** Kelompok "Blank" dipindahkan ke akhir, baik di level 1 maupun 2. */
      const moveBlankLast = <TValue>(record: Record<string, TValue>) => {
        if (!("Blank" in record)) return record;

        const { Blank, ...rest } = record;

        return { ...rest, Blank } as Record<string, TValue>;
      };

      const ordered = moveBlankLast(source);

      Object.keys(ordered).forEach((key) => {
        ordered[key] = moveBlankLast(ordered[key]);
      });

      return ordered;
    },
  });

export const useMttrResumeQuery = (params: ResumeRcaMttrParams) =>
  useQuery({
    queryKey: resumeRcaKeys.mttrResume({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getMttrResume(params, signal),
    select: (response: MttrResumeResponse): MttrResumeData => {
      const closed = response?.data?.CLOSED?.length ?? 0;
      const open = response?.data?.OPEN?.length ?? 0;

      return { total: closed + open, closed, open };
    },
  });

export const useRcaNotClearChartQuery = (params: ResumeRcaMttrParams) =>
  useQuery({
    queryKey: resumeRcaKeys.notClearChart({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getRcaNotClearChart(params, signal),
    select: (response: RcaNotClearChartResponse): number[] =>
      RCA_NOT_CLEAR_CHART_KEYS.map((key) => Number(response?.data?.[key] ?? 0)),
  });

export const useRcaNotClearDetailQuery = (params: ResumeRcaMttrParams) =>
  useQuery({
    queryKey: resumeRcaKeys.notClearDetail({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getRcaNotClearDetail(params, signal),
    select: (response: RcaNotClearDetailResponse): RcaNotClearTableData => {
      const totals: Record<string, number> = {};
      const detail: Record<string, Record<string, number>> = {};

      RCA_MTTR_REGIONS.forEach((region) => {
        totals[region] = 0;
        detail[region] = {};
      });

      /** Key API berbentuk "01-SUMBAGUT", region diambil setelah tanda "-". */
      Object.entries(response?.data?.total_ticket ?? {}).forEach(
        ([key, value]) => {
          const region = key.split("-")[1];
          if (region in totals) totals[region] = Number(value) || 0;
        },
      );

      Object.entries(response?.data?.detail ?? {}).forEach(([key, value]) => {
        const region = key.split("-")[1];
        if (!(region in detail)) return;

        Object.entries(value ?? {}).forEach(([rca, count]) => {
          detail[region][rca] = Number(count) || 0;
        });
      });

      return { totals, detail };
    },
  });

export const useTopOldestTicketsQuery = (params: {
  sitegroup: string;
  week: string;
}) =>
  useQuery({
    queryKey: resumeRcaKeys.topOldest({ ...params }),
    enabled: Boolean(params.week),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getTopOldestTickets(params, signal),
  });

export const useRcaTicketDetailQuery = (
  params: { region: string; rca: string; sitegroup: string; week: string } | null,
) =>
  useQuery({
    queryKey: resumeRcaKeys.ticketDetail({ ...(params ?? {}) }),
    enabled: Boolean(params),
    staleTime: STALE_TIME,
    queryFn: ({ signal }) =>
      getRcaTicketDetail(
        params as { region: string; rca: string; sitegroup: string; week: string },
        signal,
      ),
  });

export const useUploadReconProgressMutation = () =>
  useMutation({
    mutationFn: (file: File) => uploadReconProgress(file),
  });
