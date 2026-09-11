/** Satu baris indikator SLA WISA FBB dari endpoint `fbb/sla/wsa`. */
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
  /** Angka dikirim sebagai string, mis. "33.102492". */
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
  /** Minggu berjalan menurut server, dipakai sebagai pilihan awal. */
  active_yearweek?: string;
  data: string[];
}
