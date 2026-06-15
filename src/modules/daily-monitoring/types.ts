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
  summary_table: {
    data: DailyMonitoringSummaryRow[];
    total: DailyMonitoringSummaryTotal;
  };
};

export type DailyMonitoringSummaryView = {
  reportDate: string;
  totalTickets: number;
  rows: MttrQualityRow[];
};

