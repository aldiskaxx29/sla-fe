export interface BaselineRegionRaw {
  region: string;
  total: number;
  latency: number;
  latPersen: number;
  latWow: number;
  packetlos: number;
  pacPersen: number;
  pacWow: number;
}

export type BaselineStatus = "critical" | "warning" | "good";

export interface BaselineRegionRow extends BaselineRegionRaw {
  status: BaselineStatus;
  worstPersen: number;
}

export interface BaselinePerformanceData {
  regions: BaselineRegionRow[];
  nation: BaselineRegionRow | null;
}

export interface BaselineTrendSeries {
  name: string;
  data: (number | string | null)[];
}

export interface BaselineTrendResponse {
  week: string[];
  latency: BaselineTrendSeries[];
  packetloss: BaselineTrendSeries[];
}

export interface BaselineTrendData {
  weeks: string[];
  latency: Record<string, number[]>;
  packetloss: Record<string, number[]>;
}
