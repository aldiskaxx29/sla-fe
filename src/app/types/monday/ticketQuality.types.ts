export type StatusType = "Achievement" | "MsaNotAch" | "NotAchievement";

export type SlaDetailColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
};

export type SlaDetailRow = Record<string, string | number | null>;

/** Rincian lanjutan saat satu baris di popup diklik. */
export type SlaDetailDrilldown = {
  kind: "site" | "mttr-ticket" | "core-transit";
  /** Parameter `level` untuk endpoint site detail. */
  level?: "packetloss" | "latency" | "jitter";
  /** Parameter `distribution_pl` untuk kartu PL access. */
  distributionPl?: string;
  /** Kolom pada baris yang berisi nama region. */
  regionKey: string;
};

/** Isi popup detail saat kartu SLA diklik. */
export type SlaCardDetail = {
  title: string;
  subtitle?: string;
  columns: SlaDetailColumn[];
  rows: SlaDetailRow[];
  /** Kolom penanda baris bermasalah, dipakai untuk pewarnaan. */
  statusKey?: string;
  drilldown?: SlaDetailDrilldown;
};

export type MetricSubCard = {
  id: string;
  name: string;
  status: "success" | "warning" | "danger";
  beforeValue: string;
  currentValue: string;
  /** Default "(Before)" / "(Current)"; sebagian kartu memakai Target vs Ach. */
  beforeLabel?: string;
  currentLabel?: string;
  trend?: {
    direction: "up" | "down";
    value: string | number;
    color: "green" | "red";
  };
  nestedData?: {
    total?: number;
    /** Default "T"; mis. "Target" untuk PL access, "EBR" untuk core. */
    totalLabel?: string;
    regNotClear?: number;
    worstReg?: string;
  };
  tableData?: {
    area: string;
    target: number;
    ach: number;
  }[];
  worstText?: string;
  /** Rincian per region/EBR yang tampil di popup saat kartu diklik. */
  detail?: SlaCardDetail;
};

export type SLAMetricCard = {
  title: string;
  subCards: MetricSubCard[];
};

export type CtiRow = {
  no: number;
  peTransit: string;
  bds: {
    baseline: number;
    latency: number;
  };
  btc: {
    baseline: number;
    latency: number;
  };
  pink: {
    baseline: number;
    latency: number;
  };
};

export type RegionPerformanceInfo = {
  id: string;
  name: string;
  status: "Not Ach" | "Ach" | "Warning";
  latency: {
    value: number;
    percentage: string;
    wowValue: string;
    wowTrend: "up" | "down";
    wowColor: "green" | "red";
  };
  packetLoss: {
    value: number;
    percentage: string;
    wowValue: string;
    wowTrend: "up" | "down";
    wowColor: "green" | "red";
  };
};
