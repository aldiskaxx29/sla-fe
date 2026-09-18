/** Pilihan parameter pada filter halaman Resume RCA. */
export type ResumeRcaParameter =
  | "packetloss_>5%"
  | "packetloss_1-5%"
  | "latency"
  | "jitter"
  | "MTTRq Critical"
  | "MTTRq Major"
  | "MTTRq Minor";

export interface ResumeRcaWeekOption {
  year: number;
  week: number;
  start: string;
  end: string;
}

export interface ResumeRcaMonthWeekOption {
  year: number;
  month: number;
  week: string | number;
  label: string;
  start: string;
  end: string;
}

export interface LastWeekResponse {
  data?: {
    max_week?: number | string;
    max_year?: number | string;
    max_month?: number | string;
  };
}

export interface LastWeekData {
  maxWeek: number;
  maxYear: number;
  maxMonth: number;
}

/** Satu baris site yang belum clear, dipakai di tabel & popup. */
export interface RcaSiteRow {
  site_id?: string;
  region?: string;
  witel?: string;
  av?: string | number;
  rca?: string;
  rc2?: string;
  rca2?: string;
  status?: string;
  [key: string]: unknown;
}

export interface TrafficTableResponse {
  data?: {
    progress?: Record<string, RcaSiteRow[]>;
    site_not_clear?: Record<string, RcaSiteRow[]>;
  };
}

export interface TrafficTableData {
  progress: Record<string, RcaSiteRow[]>;
  sites: Record<string, RcaSiteRow[]>;
}

export interface TrafficChartResponse {
  data?: Record<string, { OGP?: number; CLOSED?: number }>;
}

export interface TrafficChartData {
  labels: string[];
  ogp: number[];
  closed: number[];
}

/** Ringkasan per region: total site + total/progress per label RCA. */
export interface RcaRegionProgress {
  total_site: number;
  [key: string]: number;
}

export interface ActionPlanResponse {
  data?: Record<string, Record<string, ActionPlanEntry>>;
}

export interface ActionPlanEntry {
  OGP?: Record<string, number>;
  CLOSED?: Record<string, number>;
}

export type ActionPlanData = Record<string, Record<string, ActionPlanEntry>>;

export interface TopOldestRow {
  ticket_id?: string;
  region?: string;
  rca?: string;
  ttr?: number | string;
  last_update?: string;
  [key: string]: unknown;
}

export interface MttrResumeResponse {
  data?: {
    CLOSED?: unknown[];
    OPEN?: unknown[];
  };
}

export interface MttrResumeData {
  total: number;
  closed: number;
  open: number;
}

export interface RcaNotClearChartResponse {
  data?: Record<string, number>;
}

export interface RcaNotClearDetailResponse {
  data?: {
    total_ticket?: Record<string, number>;
    detail?: Record<string, Record<string, number>>;
  };
}

export interface RcaNotClearTableData {
  totals: Record<string, number>;
  detail: Record<string, Record<string, number>>;
}

export interface RcaTicketRow {
  ticket_id?: string;
  region?: string;
  treshold?: string | number;
  ttr?: number | string;
  [key: string]: unknown;
}

export interface ResumeRcaTrafficParams {
  mode: string;
  week: string;
}

export interface ResumeRcaMttrParams {
  sitegroup: string;
  week: string;
  weekStart: string;
  weekEnd: string;
}
