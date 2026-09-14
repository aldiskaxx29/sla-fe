export interface RekonsiliasiRow extends Record<string, unknown> {
  id?: number | string;
  site_id?: string;
  week?: number | string;
  month?: number | string;
  region_tsel?: string;
  district?: string;
  area?: string;
  distribution_pl?: string;
  grouping_rca?: string;
  RCA?: string;
  detail_rca?: string;
  status_saat_ini?: string;
  value?: number | string;
}

export interface RekonsiliasiMeta {
  current_page?: number;
  per_page?: number;
  from?: number;
  to?: number;
  total?: number;
  last_page?: number;
  total_unfiltered?: number;
  search?: string | null;
  searchable?: string[];
  searchable_available?: string[];
}

export type RekonsiliasiFilterOptions = Record<string, string[]>;

export interface RekonsiliasiListResponse {
  status?: boolean;
  options?: RekonsiliasiFilterOptions;
  data?: RekonsiliasiRow[];
  meta?: RekonsiliasiMeta;
  total?: number;
}

export interface RekonsiliasiListParams {
  prev: string;
  exclude: string;
  evidence: string;
  parameter: string;
  year: string;
  month: string;
  week?: string;
  page: number;
  perPage: number;
  search?: string;
  searchable?: string[];
  filter?: Record<string, string[]>;
}

export interface FilterWeekGroup {
  month: string;
  value: string[];
}

export interface YearWeekResponse {
  status?: boolean;
  active_yearweek?: string;
  active_month?: string;
  active_week?: string;
  data?: string[];
  filterWeeks?: FilterWeekGroup[];
}

export interface RekonsiliasiPeriodParams {
  parameter: string;
  year: string;
  month: string;
  week?: string;
  exclude?: string;
  evidence?: string;
  prev?: string;
}

export interface ImportTemplatePayload {
  file: File;
  parameter: string;
  month: string;
  week?: string;
  exclude: string;
}

export interface DownloadTemplateParams {
  parameter: string;
  year: string;
  month: string;
  week?: string;
  exclude: string;
  evidence: string;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface ColumnSearch {
  field: string;
  value: string;
}
