export type MttrQualityLevel = "good" | "warning" | "danger";

export type MttrQualityRow = {
  no: string;
  area: string;
  reg: string;
  openFoRip: string;
  kuningMerah96Jam: string;
  closingTicketH1: string;
  closingTicketH: string;
  doneTaPst: string;
  achTaPst: string;
  achLevel: MttrQualityLevel;
};

export type PacketLossLevel = "good" | "warning" | "danger";

export type PacketLossRow = {
  no: string;
  region: string;
  target: string;
  siteDegradeH1: string;
  siteDegradeH: string;
  clear: string;
  growth: string;
  notClear: string;
  ach: string;
  remark: string;
  achLevel: PacketLossLevel;
  downloadType?: "region" | "area" | "total";
  isSpacerRow?: boolean;
  isTotalRow?: boolean;
};

type DailyMonitoringCountBlock = {
  total: number;
  fo: number;
  rip: number;
};

type DailyMonitoringAgingBlock = {
  kuning: number;
  merah: number;
  gt_96_jam: number;
};

type DailyMonitoringClosingBlock = {
  h_minus_1: number;
  h: number;
};

type DailyMonitoringDoneBlock = {
  ta: number;
  pst: number;
};

type DailyMonitoringAchievementBlock = {
  ach: string;
  ta: string;
  pst: string;
};

export type DailyMonitoringSummaryRow = {
  no: number;
  area: string;
  reg: string;
  open: DailyMonitoringCountBlock;
  aging: DailyMonitoringAgingBlock;
  closing_ticket: DailyMonitoringClosingBlock;
  done: DailyMonitoringDoneBlock;
  achievement: DailyMonitoringAchievementBlock;
};

type DailyMonitoringSummaryTotal = {
  open: DailyMonitoringCountBlock;
  aging: DailyMonitoringAgingBlock;
  closing_ticket: DailyMonitoringClosingBlock;
  done: DailyMonitoringDoneBlock;
  achievement: DailyMonitoringAchievementBlock;
};

export type DailyMonitoringSummaryResponse = {
  status: string;
  tanggal: string;
  total_tickets: number;
  summary_rows?: Array<{
    ticket_id: string | null;
    region_tsel: string | null;
    status: string | null;
    area: string | null;
    ttr_customer_decimal: string | number | null;
    network: string | null;
    sitegroup: string | null;
    regtsel: string | null;
    status_persen: string | number | null;
  }>;
  summary_table: {
    data: DailyMonitoringSummaryRow[];
    total: DailyMonitoringSummaryTotal;
  };
};

export type DailyMonitoringSummaryView = {
  reportDate: string;
  totalTickets: number;
  rows: MttrQualityRow[];
  summaryRows: Array<{
    ticketId: string;
    regionTsel: string;
    status: string;
    area: string;
    ttrCustomerDecimal: string;
    network: string;
    sitegroup: string;
    regtsel: string;
    statusPersen: string;
  }>;
};

export type DailyMonitoringPacketLossRegion = {
  no: number;
  region: string;
  target: number;
  site_degrade_h1: number;
  site_degrade_h: number;
  clear: number;
  growth: string;
  not_clear: number;
  ach: string;
  remark: string | null;
};

export type DailyMonitoringPacketLossArea = {
  no: number;
  area: string;
  target: number;
  site_degrade_h1: number;
  site_degrade_h: number;
  clear: number;
  growth: string;
  not_clear: number;
  ach: string;
  remark: string | null;
};

export type DailyMonitoringPacketLossTotal = {
  target: number;
  site_degrade_h1: number;
  site_degrade_h: number;
  clear: number;
  growth: string;
  not_clear: number;
  ach: string;
};

export type DailyMonitoringPacketLossResponse = {
  title: string;
  section: string;
  date: string;
  time: string;
  regions: DailyMonitoringPacketLossRegion[];
  areas: DailyMonitoringPacketLossArea[];
  total: DailyMonitoringPacketLossTotal;
};

export type DailyMonitoringPacketLossView = {
  title: string;
  section: string;
  date: string;
  time: string;
  rows: PacketLossRow[];
};
