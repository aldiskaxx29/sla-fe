/** Parameter yang tersedia di halaman Report Reconsilation. */
export type ReportSiteParameter =
  | "packetloss ran to core"
  | "jitter ran to core"
  | "latency ran to core"
  | "mttrq critical"
  | "mttrq major"
  | "mttrq minor";

export interface ReportSiteParams {
  parameter: string;
  week: string;
  month: string;
  year: string;
}

export interface ReportSiteDetailParams extends ReportSiteParams {
  region: string;
  statusSite: string;
}

export type ReportSiteExportParams = ReportSiteParams;

/** Baris tabel profiling site (region + jumlah per status). */
export interface ReportSiteProfilingRow {
  region_tsel?: string;
  total?: number | string;
  clear?: number | string;
  preventive?: number | string;
  quality?: number | string;
  sos?: number | string;
  sos_capacity?: number | string;
  sos_waranty?: number | string;
  sos_power?: number | string;
  sos_qual_tsel?: number | string;
  sos_qe?: number | string;
  blacklist?: number | string;
  [key: string]: unknown;
}

export interface ReportSiteProfilingResponse {
  data?: ReportSiteProfilingRow[];
  [key: string]: unknown;
}

export interface ReportSiteProfilingData {
  rows: ReportSiteProfilingRow[];
}

/** Baris detail site di dalam modal (popup) per kolom status. */
export interface ReportSiteDetailRow {
  site_id?: string;
  region_tsel?: string;
  witel?: string;
  [key: string]: unknown;
}

export interface ReportSiteDetailResponse {
  data?: ReportSiteDetailRow[];
  [key: string]: unknown;
}

/** Response MTTRQ: tabel detail issue + chart resume + action plan. */
export interface MttrqReportResponse {
  data?: {
    data?: Record<string, unknown>[];
    chart?: Record<string, number | string>;
    action_plan?: Record<string, unknown>[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface MttrqResumeSlice {
  label: string;
  value: number;
  color: string;
}

export interface MttrqReportData {
  resume: MttrqResumeSlice[];
  detailRows: Record<string, unknown>[];
  actionPlan: Record<string, unknown>[];
}

export interface MttrqIssueDetailRow {
  ticket_no?: string;
  site_id?: string;
  region_tsel?: string;
  status?: string;
  detail?: string;
  latest_update?: string;
  [key: string]: unknown;
}
