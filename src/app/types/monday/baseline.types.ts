/** Baris mentah Baseline Performance (assets/data/basedOnBaseline.json). */
export interface BaselineRegionRaw {
  region: string;
  /** Total site pada region tersebut. */
  total: number;
  /** Jumlah site not clear latency. */
  latency: number;
  latPersen: number;
  latWow: number;
  /** Jumlah site not clear packet loss. */
  packetlos: number;
  pacPersen: number;
  pacWow: number;
}

export type BaselineStatus = "critical" | "warning" | "good";

export interface BaselineRegionRow extends BaselineRegionRaw {
  status: BaselineStatus;
  /** Persentase not clear terburuk antara latency dan packet loss. */
  worstPersen: number;
}

export interface BaselinePerformanceData {
  regions: BaselineRegionRow[];
  /** Baris NATION dipisah karena dipakai sebagai ringkasan/footer. */
  nation: BaselineRegionRow | null;
}

/** Tren mingguan site not clear per region (assets/data/chartBasedOnBaseline.json). */
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
  /** Label minggu siap tampil, mis. "2025 W9". */
  weeks: string[];
  latency: Record<string, number[]>;
  packetloss: Record<string, number[]>;
}
