import type {
  DailyMonitoringPacketLossDetailResponse,
  DailyMonitoringPacketLossResponse,
  DailyMonitoringPacketLossView,
  DailyMonitoringSummaryResponse,
  DailyMonitoringSummaryView,
  MttrQualityLevel,
  MttrQualityRow,
  PacketLossDetailKey,
  PacketLossLevel,
  PacketLossRow,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";

const formatNumber = (value: number | string | null | undefined) =>
  String(value ?? "");

const formatTriple = (...values: Array<number | string | null | undefined>) =>
  values.map(formatNumber).join(" | ");

const formatSlash = (...values: Array<number | string | null | undefined>) =>
  values.map(formatNumber).join("/");

const parsePercent = (value: string) => {
  const numeric = Number(String(value).replace("%", "").replace(",", "."));

  return Number.isFinite(numeric) ? numeric : 0;
};

/** Lampu status: hijau >= 96%, kuning >= 75%, sisanya merah. */
export const toTrafficLightLevel = (
  value: string,
): MttrQualityLevel | PacketLossLevel => {
  const percent = parsePercent(value);

  if (percent >= 96) return "good";
  if (percent >= 75) return "warning";

  return "danger";
};

const toMttrRow = (
  row: DailyMonitoringSummaryResponse["summary_table"]["data"][number],
): MttrQualityRow => ({
  no: formatNumber(row.no),
  area: row.area,
  reg: row.reg,
  openFoRip: formatTriple(row.open.total, row.open.fo, row.open.rip),
  kuningMerah96Jam: formatSlash(
    row.aging.kuning,
    row.aging.merah,
    row.aging.gt_96_jam,
  ),
  closingTicketH1: formatNumber(row.closing_ticket.h_minus_1),
  closingTicketH: formatNumber(row.closing_ticket.h),
  doneTaPst: formatTriple(row.done.ta, row.done.pst),
  achTaPst: formatTriple(
    row.achievement.ach,
    row.achievement.ta,
    row.achievement.pst,
  ),
  achLevel: toTrafficLightLevel(row.achievement.ach) as MttrQualityLevel,
});

const toMttrTotalRow = (
  total: DailyMonitoringSummaryResponse["summary_table"]["total"],
): MttrQualityRow => ({
  no: "",
  area: "Total",
  reg: "",
  openFoRip: formatTriple(total.open.total, total.open.fo, total.open.rip),
  kuningMerah96Jam: formatSlash(
    total.aging.kuning,
    total.aging.merah,
    total.aging.gt_96_jam,
  ),
  closingTicketH1: formatNumber(total.closing_ticket.h_minus_1),
  closingTicketH: formatNumber(total.closing_ticket.h),
  doneTaPst: formatTriple(total.done.ta, total.done.pst),
  achTaPst: formatTriple(
    total.achievement.ach,
    total.achievement.ta,
    total.achievement.pst,
  ),
  achLevel: toTrafficLightLevel(total.achievement.ach) as MttrQualityLevel,
});

export const toDailyMonitoringSummaryView = (
  response: DailyMonitoringSummaryResponse,
): DailyMonitoringSummaryView => {
  const rows = response.summary_table?.data?.map(toMttrRow) ?? [];
  const summaryRows =
    response.summary_rows?.map((row) => ({
      ticketId: String(row.ticket_id ?? ""),
      regionTsel: String(row.region_tsel ?? ""),
      status: String(row.status ?? ""),
      area: String(row.area ?? ""),
      ttrCustomerDecimal: String(row.ttr_customer_decimal ?? ""),
      network: String(row.network ?? ""),
      sitegroup: String(row.sitegroup ?? ""),
      regtsel: String(row.regtsel ?? ""),
      statusPersen: String(row.status_persen ?? ""),
    })) ?? [];

  return {
    reportDate: response.tanggal,
    totalTickets: Number(response.total_tickets) || 0,
    rows: [...rows, toMttrTotalRow(response.summary_table.total)],
    summaryRows,
  };
};

const toPacketLossRow = (
  row:
    | DailyMonitoringPacketLossResponse["regions"][number]
    | DailyMonitoringPacketLossResponse["areas"][number],
  labelKey: "region" | "area",
): PacketLossRow => ({
  no: String(row.no ?? ""),
  region: String(
    (row as Record<string, unknown>)[labelKey] ?? "",
  ),
  target: String(row.target ?? ""),
  siteDegradeH1: String(row.site_degrade_h1 ?? ""),
  siteDegradeH: String(row.site_degrade_h ?? ""),
  clear: String(row.clear ?? ""),
  growth: String(row.growth ?? ""),
  notClear: String(row.not_clear ?? ""),
  ach: String(row.ach ?? ""),
  remark: String(row.remark ?? ""),
  achLevel: toTrafficLightLevel(String(row.ach ?? "")) as PacketLossLevel,
  downloadType: labelKey,
  isSpacerRow: false,
  isTotalRow: false,
});

/** Baris kosong pemisah antara blok region dan blok area. */
const SPACER_ROW: PacketLossRow = {
  no: "",
  region: "",
  target: "",
  siteDegradeH1: "",
  siteDegradeH: "",
  clear: "",
  growth: "",
  notClear: "",
  ach: "",
  remark: "",
  achLevel: "warning",
  downloadType: undefined,
  isSpacerRow: true,
};

export const toPacketLossView = (
  response: DailyMonitoringPacketLossResponse,
): DailyMonitoringPacketLossView => {
  const regionRows =
    response.regions?.map((row) => toPacketLossRow(row, "region")) ?? [];
  const areaRows =
    response.areas?.map((row) => toPacketLossRow(row, "area")) ?? [];

  const totalRow: PacketLossRow = {
    no: "",
    region: "TOTAL",
    target: String(response.total?.target ?? ""),
    siteDegradeH1: String(response.total?.site_degrade_h1 ?? ""),
    siteDegradeH: String(response.total?.site_degrade_h ?? ""),
    clear: String(response.total?.clear ?? ""),
    growth: String(response.total?.growth ?? ""),
    notClear: String(response.total?.not_clear ?? ""),
    ach: String(response.total?.ach ?? ""),
    remark: "",
    achLevel: toTrafficLightLevel(
      String(response.total?.ach ?? ""),
    ) as PacketLossLevel,
    downloadType: "total",
    isSpacerRow: false,
    isTotalRow: true,
  };

  return {
    title: response.title,
    section: response.section,
    date: response.date,
    time: response.time,
    rows: [...regionRows, SPACER_ROW, ...areaRows, totalRow],
  };
};

/**
 * Response detail membungkus data PL 5% / PL 1-5% di dalam `p5` / `p15`,
 * sedangkan judul & waktunya tetap diambil dari level teratas.
 */
export const toPacketLossDetailView = (
  response: DailyMonitoringPacketLossDetailResponse,
  pl: PacketLossDetailKey,
): DailyMonitoringPacketLossView => {
  const nested = response[pl];

  const header = {
    title: response.title,
    section: response.section,
    date: response.date,
    time: response.time,
  };

  if (!nested) return { ...header, rows: [] };

  return { ...toPacketLossView(nested), ...header };
};

export const formatMonitoringDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
