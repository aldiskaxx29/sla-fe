export type StatusType = "Achievement" | "MsaNotAch" | "NotAchievement";

export type SlaDetailColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  group?: string;
  tone?: "green" | "yellow" | "red";
};

export type SlaDetailAchievement = {
  achKey: string;
  targetKey: string;
  labelKey: string;
  groupRows?: string[];
};

export type SlaDetailRow = Record<string, string | number | null>;

export type SlaDetailDrilldown = {
  kind: "site" | "mttr-ticket" | "core-transit";
  level?: "packetloss" | "latency" | "jitter";
  distributionPl?: string;
  regionKey: string;
};

export type SlaRcaKey =
  | "packetloss_5"
  | "packetloss_1_5"
  | "latency"
  | "jitter";

export type SlaRcaSummary = {
  key: SlaRcaKey;
  notClear?: string;
  notClearUnit?: string;
};

export type SlaCardDetail = {
  title: string;
  subtitle?: string;
  columns: SlaDetailColumn[];
  rows: SlaDetailRow[];
  statusKey?: string;
  drilldown?: SlaDetailDrilldown;
  rca?: SlaRcaSummary;
  achievement?: SlaDetailAchievement;
};

export type MetricSubCard = {
  id: string;
  name: string;
  status: "success" | "warning" | "danger";
  beforeValue: string;
  currentValue: string;
  beforeLabel?: string;
  currentLabel?: string;
  trend?: {
    direction: "up" | "down";
    value: string | number;
    color: "green" | "red";
  };
  nestedData?: {
    total?: number;
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
