/** Isi dropdown filter; tiap endpoint list mengirim satu field saja. */
export interface FbbYearWeekOption {
  yearweek: number | string;
}
export interface FbbMetricsOption {
  metrics: string;
}
export interface FbbKpiOption {
  kpi: string;
}
export interface FbbLevelOption {
  level: string;
}
export interface FbbIndihomeTypeOption {
  indihome_type: string;
}

export interface FbbListResponse<TItem> {
  status: boolean;
  data: TItem[];
}

/** Paginasi seragam dipakai endpoint nation-metrics-kpi & lose-region-kabupaten. */
export interface FbbOnxMeta {
  active_yearweek?: string;
  level?: string;
  indihome_type?: string;
  metrics?: string | null;
  kpi?: string | null;
  area_name?: string | null;
  current_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
  last_page: number;
}

/** Satu baris ringkasan metrics/kpi tingkat nasional. */
export interface FbbNationMetricRow {
  metrics: string;
  kpi: string;
  /** "Win" atau "Lose". */
  status: string;
  winner: string;
  gap_to_winner: string;
  /** Nama pesaing terdekat. */
  nearest_comp: string;
  gap_to_nearest_comp: string;
  rank: number;
}

export interface FbbNationMetricsResponse {
  status: boolean;
  data: FbbNationMetricRow[];
  meta: FbbOnxMeta;
}

/**
 * Satu baris peta = satu pasangan region x winner. `benchmark` "win" berarti
 * Indihome yang menang di baris itu, dan `lose_per_total` berbentuk
 * "jumlah kalah/total pembanding", mis. "11/11" atau "0/9".
 */
export interface FbbMapRegionRow {
  regions: string;
  winner: string;
  benchmark: string;
  lose_per_total: string;
}

export interface FbbMapRegionResponse {
  status: boolean;
  data: FbbMapRegionRow[];
  meta?: {
    active_yearweek?: string;
    indihome_type?: string;
    kpi?: string;
  };
}

/** Satu baris detail kabupaten; `trend` deret nilai dipisah koma. */
export interface FbbLoseRegionRow {
  kpi_res: string;
  region_new?: string;
  region?: string;
  kabupaten: string;
  value_indihome: string;
  trend: string;
  status: string;
  benchmark_status?: string;
  winner: string;
  gap_to_winner: string;
  nearest_comp?: string;
  gap_to_nearest_comp?: string;
  rank: number;
}

export interface FbbLoseRegionResponse {
  status: boolean;
  data: FbbLoseRegionRow[];
  meta: FbbOnxMeta;
}

export interface FbbOnxFilterState {
  yearweek: string;
  metrics: string;
  kpi: string;
  level: string;
  indihomeType: string;
}

/* ------------------------------------------------------------------ *
 * Ookla — bentuk field-nya berbeda dari ONX, jadi dipetakan di hook.
 * ------------------------------------------------------------------ */

export interface FbbOoklaMetricRow {
  metrics_result: string;
  kpi_result: string;
  /** "win" atau "lose". */
  benchmark: string;
  winner: string;
  gap_to_winner: string;
  gap_to_nearest: string;
  provider_rank: number;
}

export interface FbbOoklaMetricsResponse {
  status: boolean;
  data: FbbOoklaMetricRow[];
  meta: FbbOnxMeta;
}

/** Baris peta Ookla; `status` berbentuk "kalah/total", mis. "7/7". */
export interface FbbOoklaMapRow {
  metrics_result: string;
  kpi_result: string;
  region: string;
  winner: string;
  benchmark: string;
  status: string;
}

export interface FbbOoklaMapResponse {
  status: boolean;
  data: FbbOoklaMapRow[];
  meta?: FbbOnxMeta;
}
