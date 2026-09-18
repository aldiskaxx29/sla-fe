/** Severity ticket yang dipakai seluruh dashboard Ticket Quality. */
export type TicketSeverity = "critical" | "major" | "minor";

export type TicketSeverityFilter = TicketSeverity | "all";

export type TicketAreaGroup = "jawa" | "non_jawa";

export type TicketAccessType = "fo" | "radio" | "all";

export interface TicketQualityParams {
  accessType: TicketAccessType;
  comparison: string;
  area: string;
  period: string;
}

/* -------------------------------- Highlight ------------------------------- */

export interface TicketSeverityStat {
  severity: TicketSeverity;
  target: number;
  achievement: number;
  notAchieved: number;
}

export interface TicketHighlightGroup {
  group: TicketAreaGroup;
  label: string;
  totalAch: number;
  totalAchMom: number;
  totalNotAch: number;
  totalNotAchMom: number;
  severities: TicketSeverityStat[];
}

export interface TicketRegionRank {
  region: string;
  achievement: number;
}

export interface TicketHighlightSummary {
  groups: TicketHighlightGroup[];
  bestRegions: TicketRegionRank[];
  worstRegions: TicketRegionRank[];
}

/* ----------------------------- Achievement map ---------------------------- */

export interface TicketMapRegion {
  region: string;
  ticketOpen: number;
}

export interface TicketSeverityMap {
  regions: TicketMapRegion[];
  totalTicketOpen: number;
  min: number;
  max: number;
}

export interface TicketRegionPerformanceRow {
  region: string;
  parent?: boolean;
  target: number;
  achieved: number;
  notAchieved: number;
  achievement: number;
  totalTicket: number;
  ticketOpen: {
    green: number;
    yellow: number;
    red: number;
  };
}

/* --------------------------- Performance analysis -------------------------- */

export interface TicketTtrSlice {
  label: string;
  value: number;
  percentage: number;
}

export interface TicketHighestTtr {
  area: string;
  totalTicket: number;
  slices: TicketTtrSlice[];
}

export interface TicketTrendPoint {
  month: string;
  jawa: number | null;
  nonJawa: number | null;
}

export interface TicketAchievementDistribution {
  totalAchieved: number;
  totalNotAchieved: number;
}
