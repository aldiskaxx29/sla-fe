export interface OperatorData {
  mean: number;
  operator: string;
  label: string;
  yearWeek: number | null;
  date: string | null;
  rank: number;
  previous: {
    mean: number;
    operator: string;
    label: string;
    yearWeek: number | null;
    date: string | null;
    rank: number;
  } | null;
}

export interface ChartData {
  latency: OperatorData[];
  jitter: OperatorData[];
  packetloss: OperatorData[];
  availability?: OperatorData[];
  coreConsistentQuality?: OperatorData[];
  excellentConsistentQuality?: OperatorData[];
}

export interface OperatorConfig {
  color: string;
  bg: string;
  text: string;
  border?: string;
  label: string;
}

export interface ProviderConfig {
  color: string;
  bg: string;
  text: string;
  border?: string;
}
