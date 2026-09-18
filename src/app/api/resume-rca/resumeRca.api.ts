import { qosmoRequest, qosmoUrl } from "@/app/api/resume-rca/qosmo-client";

import type {
  ActionPlanResponse,
  LastWeekResponse,
  RcaNotClearChartResponse,
  RcaNotClearDetailResponse,
  RcaSiteRow,
  RcaTicketRow,
  TopOldestRow,
  TrafficChartResponse,
  TrafficTableResponse,
  MttrResumeResponse,
} from "@/app/types/resume-rca/resumeRca.types";

export const RESUME_RCA_ENDPOINTS = {
  rca: "/baseapi/vrca.php",
  recon: "/baseapi/vrecon.php",
  upload: "/baseapi/upload.php",
} as const;

/** `mode` berbentuk "packetloss_>5%" -> traffic "packetloss", dist ">5%". */
export const splitTrafficMode = (mode: string) => {
  const [traffic, dist = ""] = mode.split("_");

  return { traffic: traffic.toLowerCase(), dist };
};

/** `week` berbentuk "12-2026" -> week "12", year "2026". */
export const splitWeekValue = (week: string) => {
  const [value, year = ""] = week.split("-");

  return { week: value, year };
};

export const getLastWeek = (isMttr: boolean, signal?: AbortSignal) =>
  qosmoRequest<LastWeekResponse>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=${isMttr ? "last-week-ticket" : "last-week-twamp"}`,
    signal,
  );

export const getTrafficNationalTotal = async (
  { mode, week }: { mode: string; week: string },
  signal?: AbortSignal,
) => {
  const { traffic, dist } = splitTrafficMode(mode);
  const period = splitWeekValue(week);

  const response = await qosmoRequest<{ data?: unknown[] }>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=rca-${traffic}&week=${period.week}&year=${period.year}&dist=${dist}`,
    signal,
  );

  return response?.data?.length ?? 0;
};

export const getTrafficTable = (
  { mode, week }: { mode: string; week: string },
  signal?: AbortSignal,
) => {
  const { traffic, dist } = splitTrafficMode(mode);
  const period = splitWeekValue(week);

  return qosmoRequest<TrafficTableResponse>(
    `${RESUME_RCA_ENDPOINTS.recon}?cmd=table-recon&traffic=${traffic}&week=${period.week}&year=${period.year}&dist=${dist}`,
    signal,
  );
};

export const getTrafficChart = (
  { mode, week }: { mode: string; week: string },
  signal?: AbortSignal,
) => {
  const { traffic, dist } = splitTrafficMode(mode);
  const period = splitWeekValue(week);

  return qosmoRequest<TrafficChartResponse>(
    `${RESUME_RCA_ENDPOINTS.recon}?cmd=chart-recon&traffic=${traffic}&week=${period.week}&year=${period.year}&dist=${dist}`,
    signal,
  );
};

export const getActionPlan = (
  { mode, week }: { mode: string; week: string },
  signal?: AbortSignal,
) => {
  const { traffic, dist } = splitTrafficMode(mode);
  const period = splitWeekValue(week);

  return qosmoRequest<ActionPlanResponse>(
    `${RESUME_RCA_ENDPOINTS.recon}?cmd=action-plan&traffic=${traffic}&week=${period.week}&year=${period.year}&dist=${dist}`,
    signal,
  );
};

export const getMttrResume = (
  {
    sitegroup,
    week,
    weekStart,
    weekEnd,
  }: { sitegroup: string; week: string; weekStart: string; weekEnd: string },
  signal?: AbortSignal,
) => {
  const period = splitWeekValue(week);

  return qosmoRequest<MttrResumeResponse>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=resume&weekstart=${weekStart}&weekend=${weekEnd}&week=${period.week}&year=${period.year}&sitegroup=${sitegroup}`,
    signal,
  );
};

/**
 * Chart RCA not clear memakai Rtoken statis dari env, mengikuti perilaku
 * halaman lama (endpoint ini menolak token level user biasa).
 */
export const getRcaNotClearChart = (
  {
    sitegroup,
    week,
    weekStart,
    weekEnd,
  }: { sitegroup: string; week: string; weekStart: string; weekEnd: string },
  signal?: AbortSignal,
) => {
  const period = splitWeekValue(week);

  return qosmoRequest<RcaNotClearChartResponse>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=chart-rca-not-clear&weekstart=${weekStart}&weekend=${weekEnd}&week=${period.week}&year=${period.year}&sitegroup=${sitegroup}`,
    signal,
    { Rtoken: import.meta.env.VITE_QOSMO_RTOKEN || "MQ==" },
  );
};

export const getRcaNotClearDetail = (
  {
    sitegroup,
    week,
    weekStart,
    weekEnd,
  }: { sitegroup: string; week: string; weekStart: string; weekEnd: string },
  signal?: AbortSignal,
) => {
  const period = splitWeekValue(week);

  return qosmoRequest<RcaNotClearDetailResponse>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=detail-rca-not-clear&weekstart=${weekStart}&weekend=${weekEnd}&week=${period.week}&year=${period.year}&sitegroup=${sitegroup}`,
    signal,
  );
};

export const getTopOldestTickets = async (
  { sitegroup }: { sitegroup: string },
  signal?: AbortSignal,
) => {
  const response = await qosmoRequest<{ data?: TopOldestRow[] }>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=top-oldest&sitegroup=${sitegroup}`,
    signal,
  );

  return response?.data ?? [];
};

export const getRcaTicketDetail = async (
  {
    region,
    rca,
    sitegroup,
    week,
  }: { region: string; rca: string; sitegroup: string; week: string },
  signal?: AbortSignal,
) => {
  const period = splitWeekValue(week);

  const response = await qosmoRequest<{ data?: RcaTicketRow[] }>(
    `${RESUME_RCA_ENDPOINTS.rca}?cmd=pop-not-clear&region=${region}&rca=${rca}&week=${period.week}&year=${period.year}&sitegroup=${sitegroup}`,
    signal,
  );

  return response?.data ?? [];
};

export const uploadReconProgress = async (file: File) => {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(qosmoUrl(RESUME_RCA_ENDPOINTS.upload), {
    method: "POST",
    body,
  });

  const result = (await response.json()) as {
    status?: string;
    message?: string;
  };

  if (result?.status !== "success") {
    throw new Error(result?.message || "Upload gagal, silakan coba lagi.");
  }

  return result;
};

export type { RcaSiteRow };
