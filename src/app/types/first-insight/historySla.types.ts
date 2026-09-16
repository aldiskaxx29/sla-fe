export interface HistorySlaHighlightBreakdown {
  category: string;
  not_achieved: number;
  total: number;
}

export interface HistorySlaHighlightSummary {
  total_kpi_not_achieved: {
    value: number;
    total: number;
  };
  breakdown: HistorySlaHighlightBreakdown[];
}

export interface HistorySlaHighlightSummaryResponse {
  status: boolean;
  data: HistorySlaHighlightSummary;
  meta?: {
    period?: string;
  };
}

export interface HistorySlaCategoryValue {
  category: string;
  value: number;
}

export interface HistorySlaTrendMonth {
  month: string;
  total: number;
  breakdown: HistorySlaCategoryValue[];
}

export interface HistorySlaTrendResponse {
  status: boolean;
  data: {
    unit: string;
    monthly: HistorySlaTrendMonth[];
  };
  meta?: {
    period?: string;
    active_month?: string;
  };
}

export interface HistorySlaTrendPoint extends HistorySlaTrendMonth {
  period: string;
}

export type HistorySlaAchievement = Record<string, Record<string, string>>;

export interface HistorySlaTableRow {
  no: number;
  kpi_category: string;
  performance_indicator: string;
  threshold: string;
  achievement: HistorySlaAchievement;
}

export interface HistorySlaTableMeta {
  period?: string;
  columns?: {
    quarters: string[];
    sub_columns_per_quarter: string[];
  };
  current_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
  last_page: number;
  total_unfiltered?: number;
  search?: string | null;
}

export interface HistorySlaTableResponse {
  status: boolean;
  options?: {
    kpi_category?: string[];
    threshold?: string[];
  };
  data: HistorySlaTableRow[];
  meta: HistorySlaTableMeta;
}

export interface HistorySlaTableParams {
  kpiCategory?: string;
  search?: string;
}

export interface HistorySlaMonthValue {
  key: string;
  label: string;
  value: string;
  achieved: boolean;
}

export interface HistorySlaQuarter {
  key: string;
  label: string;
  target: string;
  months: HistorySlaMonthValue[];
}

export interface HistorySlaIndicator {
  no: number;
  category: string;
  indicator: string;
  threshold: string;
  quarters: HistorySlaQuarter[];
}

export interface HistorySlaTableData {
  rows: HistorySlaIndicator[];
  categoryOptions: string[];
  meta?: HistorySlaTableMeta;
}
