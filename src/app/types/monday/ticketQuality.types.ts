export type StatusType = "Achievement" | "MsaNotAch" | "NotAchievement";

export type SlaDetailColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  /** Judul grup di baris header pertama, mis. "Ticket Close". */
  group?: string;
  /** Warna sel header, mengikuti arti kolomnya. */
  tone?: "green" | "yellow" | "red";
};

/** Pewarnaan baris ala tabel MTTR: hijau kalau ach >= target. */
export type SlaDetailAchievement = {
  achKey: string;
  targetKey: string;
  /** Kolom nama region yang ikut diwarnai. */
  labelKey: string;
  /** Baris ringkasan (mis. Jawa / Non Jawa) diberi latar penuh. */
  groupRows?: string[];
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

/** Kunci grup RCA pada assets/data/resumGroupingRca.json. */
export type SlaRcaKey =
  | "packetloss_5"
  | "packetloss_1_5"
  | "latency"
  | "jitter";

/** Ringkasan RCA yang ditampilkan sebagai kartu di atas tabel popup. */
export type SlaRcaSummary = {
  key: SlaRcaKey;
  /** Angka pada kartu "Total Not Clear". */
  notClear?: string;
  /** Satuan di bawah angka, mis. "Site". */
  notClearUnit?: string;
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
  /** Kartu ringkasan RCA (Total Not Clear, Capacity, ...) di atas tabel. */
  rca?: SlaRcaSummary;
  achievement?: SlaDetailAchievement;
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
