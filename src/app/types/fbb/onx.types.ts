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

export interface FbbNationMetricRow {
  metrics: string;
  kpi: string;
  value?: string | number | null;
  status: string;
  winner: string;
  gap_to_winner: string;
  nearest_comp: string;
  gap_to_nearest_comp: string;
  rank: number;
}

export interface FbbNationMetricsResponse {
  status: boolean;
  data: FbbNationMetricRow[];
  meta: FbbOnxMeta;
}

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

export interface FbbLoseRegionRow {
  kpi_res: string;
  region_new?: string;
  region?: string;
  kabupaten?: string;
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
  indihomeType: string;
}

export interface FbbOoklaMetricRow {
  metrics_result: string;
  kpi_result: string;
  value?: string | number | null;
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
