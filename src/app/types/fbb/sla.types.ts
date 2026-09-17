export interface SlaWsaItem {
  sumber_data: string;
  segmen: string;
  performance_indicator: string;
  layanan: string;
  level: string;
  yearweek: number | string;
  date_start: string;
  date_end: string;
  provider: string;
  parameter: string;
  satuan: string;
  target: string;
  value: string;
  capaian: string;
}

export interface SlaWsaResponse {
  status: boolean;
  data: SlaWsaItem[];
  meta?: {
    sumber_data?: string[];
    source?: Record<
      string,
      {
        active_level?: string;
        active_provider?: string;
        active_yearweek?: string;
        parameter?: string[];
      }
    >;
  };
}

export interface FbbYearWeekResponse {
  status: boolean;
  active_yearweek?: string;
  data: string[];
}

export interface SlaWsaDetailRow {
  sla_names: string;
  part: string;
  region: string;
  kabupaten?: string;
  value: string;
  trend: string;
  target: string;
  status_result: string;
  capaian_pct_result: string;
  gap_to_target_result: string;
}

export interface SlaWsaDetailMeta {
  sumber_data?: string;
  level?: string;
  parameter?: string;
  kpi?: string;
  yearweek?: string;
  provider?: string;
  region?: string;
  search?: string | null;
  current_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
  last_page: number;
}

export interface SlaWsaDetailResponse {
  status: boolean;
  data: SlaWsaDetailRow[];
  meta: SlaWsaDetailMeta;
}

export interface SlaWsaDetailParams {
  yearweek?: string | null;
  parameter?: string;
  sumberData?: string;
  region?: string;
  showAll?: boolean;
}
