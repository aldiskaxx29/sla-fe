import type { SlaRcaKey } from "@/app/types/monday/ticketQuality.types";

/**
 * Bentuk mentah data SLA dari Monday Monitoring lama. Angkanya dikirim sebagai
 * string dan tidak konsisten: ada yang pakai titik ("99.50"), ada yang koma
 * ("99,50").
 */

export interface AccessPlTotal {
  /** "1-5%" atau ">5%" */
  distribution_pl: string;
  total: number | string;
}

/** assets/sla/[after/]msa/access/packetloss{5,15}.json */
export interface MsaAccessRow {
  region_tsel: string;
  total_site: number | string;
  target: number | string;
  realisasi: number | string;
  gap_hijau?: number | string;
  status_: string;
}

/** assets/sla/[after/]cnop/access/{latency,jitter}.json */
export interface CnopAccessRow {
  region_tsel: string;
  total_site: number | string;
  not_clear?: number | string;
  target: string;
  ach: string;
  status: string;
}

/** assets/sla/[after/]mttr/region{Major,Minor,Critical}.json */
export interface MttrRegionRow {
  region_tsel: string;
  treshold?: string;
  target: string;
  /** Bisa null kalau minggu itu tidak ada tiket close. */
  ach: string | null;
  tiket_close?: string;
  /** Tiket close yang memenuhi SLA (hijau). */
  tiket_close_clear?: string;
  tiket_close_not_clear?: string;
  tiket_open?: string;
  /** Sebaran tiket open: masih aman, mendekati, dan lewat SLA. */
  hijau?: string;
  kuning?: string;
  merah?: string;
  total_tiket?: string;
}

/** assets/sla/core/{packetloss,jitter,latency_*}.json */
export interface CoreSlaRow {
  region: string;
  target_sla: string;
  /** packetloss.json memakai `realisasi`, file core lain `realisasi_sla`. */
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

/** Periode tampilan, sama seperti dropdown Week/Month di monday lama. */
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
  /** Total site PL access minggu terpilih dan minggu sebelumnya. */
  plCurrentWeek: AccessPlTotal[];
  plPreviousWeek: AccessPlTotal[];
  currentWeekLabel: string;
  previousWeekLabel: string;
}

/** Detail level-2: daftar site per region (a=siteDetailRegion). */
export interface SiteDetailRow {
  region?: string;
  region_tsel?: string;
  witel?: string;
  site_id?: string;
  value?: string | number;
  rca?: string;
  analisis?: string;
}

/** Detail level-2 MTTR: tiket per region (assets/sla/mttr/all_reg_ttr.json). */
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

/** Detail level-2 core: nilai per transit (assets/sla/core/detailCore.json). */
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

/** Satu baris ringkasan RCA; `grouping_rca` null artinya belum dikelompokkan. */
export interface SlaRcaGroupingItem {
  grouping_rca: string | null;
  total: number;
}

export type SlaRcaGroupingResponse = Partial<
  Record<SlaRcaKey, SlaRcaGroupingItem[]>
>;
