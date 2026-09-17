/** Baris tabel MSA dipetakan dari response backend yang kolomnya dinamis. */
export type MsaRow = Record<string, unknown>;

export type MsaLevel = "nation" | "area" | "region";

export type MsaSlaMode = "monthly" | "weekly";

export interface MsaAchievementParams {
  /** `all` berarti semua area, dikirim ke API sebagai `ALL`. */
  treg: string;
  year?: number;
}

export interface MsaRegionParams extends MsaAchievementParams {
  parameter: string;
}

export interface MsaWitelParams extends MsaAchievementParams {
  parameter: string;
  region: string;
  wilayah?: string;
}

export interface MsaTrendParams {
  level: MsaLevel;
  parameter: string;
  treg: string;
}

export interface MsaTrendSeries {
  name: string;
  data: number[];
}

export interface MsaTrendData {
  week: string[];
  data: MsaTrendSeries[];
}

export interface MsaHistoryParams {
  kpi: string;
  treg: string;
  /** `by ach` atau `by total ne`, mengikuti pilihan "Filter By". */
  filter?: string;
  /** Tabel weekly memakai data rekonsiliasi `before`. */
  rekon?: string;
  level?: "region" | "witel";
  region?: string;
  type?: string;
}

export interface MsaComplyItem {
  parameter: string;
  jumlah: number;
}

export interface MsaWeeklyDetailParams {
  week: string;
  year: number;
  kpi: string;
  region: string;
}

export interface MsaRealisasiParams {
  kpi: string;
  monthNum: number;
  year: number;
}

export interface MsaRealisasiData {
  before: MsaRow[];
  after: MsaRow[];
}

export interface MsaSiteWeekParams {
  year: number;
  week: number | string;
  type: string;
  status: "before" | "after";
  region: string;
}
