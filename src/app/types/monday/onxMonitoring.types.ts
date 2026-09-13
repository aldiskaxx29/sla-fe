/** Provider yang diukur ONX; kolomnya sama di ringkasan maupun detail. */
export type OnxProvider = "aws" | "google" | "others";

/** Satu baris ringkasan `monday-monitoring/onx/summary` (jumlah IP per provider). */
export interface OnxSummaryRow {
  no: number;
  region: string;
  code: string;
  baseline: number | null;
  aws: number | null;
  google: number | null;
  others: number | null;
  all: number | null;
}

export interface OnxSummaryResponse {
  status: boolean;
  date?: string;
  hour?: number;
  data: OnxSummaryRow[];
}

/** Satu IP tujuan pada detail ONX; baseline-nya per IP, bukan per baris. */
export interface OnxDetailEntry {
  ip_address: string;
  baseline: number | null;
  latency: number | string | null;
}

export interface OnxDetailRow {
  no: number;
  region: string;
  code: string;
  aws?: OnxDetailEntry[];
  google?: OnxDetailEntry[];
  others?: OnxDetailEntry[];
  all: number | null;
}

export interface OnxDetailResponse {
  status: boolean;
  /** "ALL" kalau tidak difilter, selain itu nama provider-nya. */
  provider?: string;
  date?: string;
  hour?: number;
  data: OnxDetailRow[];
}

/** Filter detail ONX; dikirim sesuai yang diklik user. */
export interface OnxDetailParams {
  region?: string;
  provider?: OnxProvider;
  code?: string;
}
