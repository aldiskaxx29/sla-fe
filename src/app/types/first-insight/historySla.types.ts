export type HistorySlaSegment = "MBB" | "FBB" | "OLO" | "EBIS";

export type HistorySlaValueType = "count" | "percent";

export interface HistorySlaSegmentSummary {
  segment: HistorySlaSegment;
  not_achieved: number;
  total: number;
}

export interface HistorySlaTrendPoint {
  month: string;
  period: string;
  total: number;
  segments: Record<HistorySlaSegment, number>;
}

export interface HistorySlaMonthValue {
  label: string;
  value: number;
  achieved: boolean;
}

export interface HistorySlaQuarter {
  label: string;
  target: number;
  months: HistorySlaMonthValue[];
}

export interface HistorySlaIndicator {
  no: number;
  segment: HistorySlaSegment;
  kpi: string;
  indicator: string;
  threshold: string;
  value_type: HistorySlaValueType;
  quarters: HistorySlaQuarter[];
}

export interface HistorySlaData {
  year: number;
  period: string;
  total_not_achieved: number;
  total_kpi: number;
  segments: HistorySlaSegmentSummary[];
  trend: HistorySlaTrendPoint[];
  indicators: HistorySlaIndicator[];
}

export interface HistorySlaResponse {
  status: boolean;
  data: HistorySlaData;
}
