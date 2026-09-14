import type { SlaRcaKey } from "@/app/types/monday/ticketQuality.types";

export interface AccessPlTotal {
  distribution_pl: string;
  total: number | string;
}

export interface MsaAccessRow {
  region_tsel: string;
  total_site: number | string;
  target: number | string;
  realisasi: number | string;
  gap_hijau?: number | string;
  status_: string;
}

export interface CnopAccessRow {
  region_tsel: string;
  total_site: number | string;
  not_clear?: number | string;
  target: string;
  ach: string;
  status: string;
}

export interface MttrRegionRow {
  region_tsel: string;
  treshold?: string;
  target: string;
  ach: string | null;
  tiket_close?: string;
  tiket_close_clear?: string;
  tiket_close_not_clear?: string;
  tiket_open?: string;
  hijau?: string;
  kuning?: string;
  merah?: string;
  total_tiket?: string;
}

export interface CoreSlaRow {
  region: string;
  target_sla: string;
  realisasi?: string;
  realisasi_sla?: string;
  ebr?: number | string;
  total_ebr?: number | string;
  total_clear?: number | string;
  clear?: number | string;
  total_not_clear?: number | string;
  not_clear?: number | string;
  status?: string;
}

export type SlaRekon = "before" | "after";

export type SlaPeriod = "week" | "month";

export interface SlaPerformanceSources {
  packetLoss5: MsaAccessRow[];
  packetLoss15: MsaAccessRow[];
  latencyAccess: CnopAccessRow[];
  jitterAccess: CnopAccessRow[];
  mttrMajor: MttrRegionRow[];
  mttrMinor: MttrRegionRow[];
  mttrCritical: MttrRegionRow[];
  corePacketLoss: CoreSlaRow[];
  coreJitter: CoreSlaRow[];
  coreLatency: { code: string; rows: CoreSlaRow[] }[];
  plCurrentWeek: AccessPlTotal[];
  plPreviousWeek: AccessPlTotal[];
  currentWeekLabel: string;
  previousWeekLabel: string;
}

export interface SiteDetailRow {
  region?: string;
  region_tsel?: string;
  witel?: string;
  site_id?: string;
  value?: string | number;
  rca?: string;
  analisis?: string;
}

export interface MttrTicketRow {
  ticket_id?: string;
  trouble_headline?: string;
  region?: string;
  region_tsel?: string;
  witel?: string;
  site_id?: string;
  ttr_customer_jam?: number | string;
  status?: string;
  reportedby?: string;
}

export interface CoreTransitRow {
  region_tsel?: string;
  treg?: string;
  transit?: string;
  packetloss_btc?: string | number | null;
  packetloss_bds?: string | number | null;
  jitter_btc?: string | number | null;
  jitter_bds?: string | number | null;
  latency_btc?: string | number | null;
  latency_bds?: string | number | null;
  latency_pnk?: string | number | null;
}

export interface SlaRcaGroupingItem {
  grouping_rca: string | null;
  total: number;
}

export type SlaRcaGroupingResponse = Partial<
  Record<SlaRcaKey, SlaRcaGroupingItem[]>
>;
