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

export interface YearWeekResponse {
  status: boolean;
  active_yearweek?: string;
  data: string[];
}
