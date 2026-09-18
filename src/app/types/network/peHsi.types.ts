export type PeHsiPath = "BTC" | "BDS" | "PNK" | "JT2";

export type PeHsiGranularity = "hourly" | "daily" | "weekly";

export type PeHsiMetric = "latency" | "packetloss" | "jitter";

export interface PeHsiBestPath {
  path: PeHsiPath;
  percentage: number;
}

export interface PeHsiIssueBreakdown {
  metric: PeHsiMetric;
  label: string;
  total: number;
}

export interface PeHsiPerformanceLinkResponse {
  jumlah_link: number;
  /** Persentase best path per gateway, contoh: `{ BTC: 66 }`. */
  best_path: Record<string, number>;
  issue_link: number;
  /** Jumlah issue per metrik, contoh: `{ "Packet Loss": 1 }`. */
  breakdown: Record<string, number>;
}

export interface PeHsiDateTimeResponse {
  datetime: string;
}

export interface PeHsiPerformanceLink {
  totalLink: number;
  bestPath: PeHsiBestPath[];
  issueLink: number;
  issueBreakdown: PeHsiIssueBreakdown[];
}

export interface PeHsiListPeResponse {
  hostname: string;
}

export interface PeHsiPivotItem {
  pe_hsi: string;
  baseline_str: string;
  /** Gateway yang tidak achieve, contoh: `""`, `"PNK"`, `"BTC, JT2"`. */
  status?: string;
  BTC: number | null;
  BDS: number | null;
  PNK: number | null;
  JT2: number | null;
}

export interface PeHsiPivotArea {
  area_name: string;
  pe_count: number;
  items: PeHsiPivotItem[];
}

export type PeHsiPivotResponse = PeHsiPivotArea[];

/** Satu link PE-gateway yang tidak achieve pada titik trend tertentu. */
export interface PeHsiUnachievedItem {
  hostname: string;
  verifierid: string;
  avg_latency: number;
  baseline: number;
}

export interface PeHsiTrendResponse {
  categories: string[];
  series: number[];
  /** Sejajar dengan `series`: daftar link bermasalah per titik waktu. */
  unachieved_list?: PeHsiUnachievedItem[][];
}

export interface PeHsiTrendPoint {
  label: string;
  value: number;
  unachieved: PeHsiUnachievedItem[];
}

export interface PeHsiParams {
  date?: string;
  hour?: number | string;
}

export interface PeHsiTrendSummaryParams extends PeHsiParams {
  /** Rentang trend: `hourly`, `daily`, atau `weekly`. */
  filter?: PeHsiGranularity;
}

export interface PeHsiVerifierParams extends PeHsiParams {
  /** Nama PE/transit yang dipilih di popup. */
  peHsi?: string;
  /** Rentang trend di popup: `hourly`, `daily`, atau `weekly`. */
  filter?: PeHsiGranularity;
}

export interface PeHsiVerifierTrend {
  verifier_name: string;
  categories: string[];
  series: number[];
  current_count: number;
}

export type PeHsiVerifierTrendResponse = PeHsiVerifierTrend[];

export interface PeHsiTracerouteHop {
  no: number;
  ip_address: string;
  latency_ms: number;
}

export interface PeHsiGatewayPerformance {
  gateway: PeHsiPath;
  latency_ms: number | null;
  jitter_ms: number | null;
  packet_loss: number;
  status: string;
  /** KPI penyebab status NOK, contoh `"Latency"`; `"-"` kalau OK. */
  kpi: string;
}

export interface PeHsiGatewayLatencySeries {
  gateway: PeHsiPath;
  series: number[];
}

export interface PeHsiLatencyTrend {
  categories: string[];
  gateways: PeHsiGatewayLatencySeries[];
}

export interface PeHsiDetailParams extends PeHsiParams {
  peHsi: string;
}

export interface PeHsiDetailOverviewResponse {
  gateway: string;
  latency: number | null;
  jitter: number | null;
  packet_loss: number | null;
  status: string;
  kpi: string | null;
}

export interface PeHsiDetailTrendSeriesResponse {
  /** Format `"BDS Latency"`. */
  name: string;
  data: Array<number | null>;
}

export interface PeHsiDetailResponse {
  link_degrade: number;
  overview: PeHsiDetailOverviewResponse[];
  latency_trend: {
    categories: string[];
    series: PeHsiDetailTrendSeriesResponse[];
    raw_table?: Array<Record<string, number | string | null>>;
  };
}

export interface PeHsiLinkDetail {
  pe_hsi: string;
  /** Gateway dengan latency terendah; kosong kalau semua gateway tanpa data. */
  best_path?: PeHsiPath;
  best_path_status: string;
  link_degrade: number;
  /** Endpoint belum menyediakan traceroute, jadi untuk sementara kosong. */
  traceroute: PeHsiTracerouteHop[];
  gateways: PeHsiGatewayPerformance[];
  latency_trend: PeHsiLatencyTrend;
}
