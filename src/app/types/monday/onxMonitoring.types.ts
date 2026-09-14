export type OnxProvider = "aws" | "google" | "others";

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
  provider?: string;
  date?: string;
  hour?: number;
  data: OnxDetailRow[];
}

export interface OnxDetailParams {
  region?: string;
  provider?: OnxProvider;
  code?: string;
}
