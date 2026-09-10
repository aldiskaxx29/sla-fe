/** Metrik yang tersedia untuk chart trend (nilai persis seperti nama file JSON). */
export type TrendMetric = "latency" | "packetloss" | "jitter";

/**
 * Level agregasi chart trend, sama dengan tombol NATION/TERITORY/TREG/REGION
 * di monday monitoring lama.
 */
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

/** Bentuk asli file chart di Monday Monitoring lama (format seri Highcharts). */
export interface TrendChartResponse {
  week: TrendChartWeek[];
  data: TrendChartSeries[];
}

/**
 * Baris tabel Monitoring CTI. Kolom bds/btc/pnk dikirim sebagai potongan HTML
 * (`<a ...>16.51</a>`), jadi angkanya perlu diambil dari teksnya.
 */
export interface CtiRawRow {
  transit?: string;
  bds_baseline?: string | number | null;
  bds_latency?: string | number | null;
  btc_baseline?: string | number | null;
  btc_latency?: string | number | null;
  pnk_baseline?: string | number | null;
  pnk_latency?: string | number | null;
}

/** Satu titik per jam pada detail latency CTI (executive core API). */
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

/** Baris mentah RPJ CX (magista_{latency,pl,jitter}.json). */
export interface MagistaRow {
  location?: string;
  node?: string;
  yearweek?: string;
  telkomsel?: number | null;
  xl?: number | null;
  "Indosat Ooredoo"?: number | null;
  smartfren?: number | null;
  /** Operator dengan nilai terbaik menurut server. */
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
  /** Nama tampilan, mis. "Treg 1" atau "Sumbagut". */
  label: string;
  isParent: boolean;
  children: RpjBenchmarkRow[];
  packetloss: RpjOperatorValues;
  latency: RpjOperatorValues;
  jitter: RpjOperatorValues;
}
