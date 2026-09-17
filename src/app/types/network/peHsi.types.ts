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

export interface PeHsiSummaryData {
  last_updated: string;
  total_link: number;
  best_path: PeHsiBestPath[];
  issue_link: number;
  issue_breakdown: PeHsiIssueBreakdown[];
}

export interface PeHsiPivotItem {
  pe_hsi: string;
  baseline_str: string;
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

export interface PeHsiTrendResponse {
  categories: string[];
  series: number[];
}

export interface PeHsiTrendPoint {
  label: string;
  value: number;
}

export interface PeHsiParams {
  date?: string;
  hour?: number | string;
}

export interface PeHsiVerifierParams extends PeHsiParams {
  /** Nama PE/transit yang dipilih di popup. */
  peHsi?: string;
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
}

export interface PeHsiGatewayLatencySeries {
  gateway: PeHsiPath;
  series: number[];
}

export interface PeHsiLatencyTrend {
  categories: string[];
  gateways: PeHsiGatewayLatencySeries[];
}

export interface PeHsiLinkDetail {
  pe_hsi: string;
  best_path: PeHsiPath;
  best_path_status: string;
  link_degrade: number;
  traceroute: PeHsiTracerouteHop[];
  gateways: PeHsiGatewayPerformance[];
  latency_trend: PeHsiLatencyTrend;
}
