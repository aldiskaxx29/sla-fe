export type TrendMetric = "latency" | "packetloss" | "jitter";

export type TrendScope = "nation" | "area" | "region" | "region_tsel";

export type TrendKind = "core" | "access";

export interface TrendChartWeek {
  week: number;
  year?: number;
  start?: string;
  end?: string;
}

export interface TrendChartSeries {
  name: string;
  data: (number | null)[];
}

export interface TrendChartResponse {
  week: TrendChartWeek[];
  data: TrendChartSeries[];
}

export interface CtiRawRow {
  transit?: string;
  bds_baseline?: string | number | null;
  bds_latency?: string | number | null;
  btc_baseline?: string | number | null;
  btc_latency?: string | number | null;
  pnk_baseline?: string | number | null;
  pnk_latency?: string | number | null;
}

export interface CtiTransitDetailRow {
  hour_?: string;
  date?: string;
  hour?: string;
  verifierid?: string;
  target?: string;
  latency?: string | number;
  baseline?: string | number;
  transit?: string;
  region?: string;
}

export interface CtiTransitDetailResponse {
  status?: boolean | string;
  data?: Record<string, CtiTransitDetailRow[]>;
}

export type CtiVerifier = "BDS" | "BTC" | "PNK";

export interface MagistaRow {
  location?: string;
  node?: string;
  yearweek?: string;
  telkomsel?: number | null;
  xl?: number | null;
  "Indosat Ooredoo"?: number | null;
  smartfren?: number | null;
  operator?: string;
  benchmark?: string;
}

export type RpjMetric = "packetloss" | "latency" | "jitter";

export interface RpjOperatorValues {
  telkomsel: number | null;
  indosat: number | null;
  smartfren: number | null;
  xl: number | null;
}

export interface RpjBenchmarkRow {
  id: string;
  label: string;
  isParent: boolean;
  children: RpjBenchmarkRow[];
  packetloss: RpjOperatorValues;
  latency: RpjOperatorValues;
  jitter: RpjOperatorValues;
}
