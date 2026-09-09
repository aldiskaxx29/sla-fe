export type StatusType = "Achievement" | "MsaNotAch" | "NotAchievement";

export type MetricSubCard = {
  id: string;
  name: string;
  status: "success" | "warning" | "danger";
  beforeValue: string;
  currentValue: string;
  trend?: {
    direction: "up" | "down";
    value: string | number;
    color: "green" | "red";
  };
  nestedData?: {
    total?: number;
    regNotClear?: number;
    worstReg?: string;
  };
  tableData?: {
    area: string;
    target: number;
    ach: number;
  }[];
  worstText?: string;
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

export type BenchmarkValue = {
  trophy: {
    type: "gold" | "silver" | "bronze" | "green_check";
    value: number;
    trend: "up" | "down";
  };
  warning: {
    value: number;
    trend: "up" | "down";
  };
};

export type BenchmarkRow = {
  id: string;
  area: string;
  latency: BenchmarkValue;
  packetLoss: BenchmarkValue;
  jitter: BenchmarkValue;
};
