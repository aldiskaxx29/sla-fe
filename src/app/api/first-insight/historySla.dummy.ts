import type {
  HistorySlaData,
  HistorySlaIndicator,
  HistorySlaSegment,
  HistorySlaTrendPoint,
  HistorySlaValueType,
} from "@/app/types/first-insight/historySla.types";

const YEAR = 2026;

const MONTHS = [
  { short: "Jan", fm: "FM Jan", long: "Jan" },
  { short: "Feb", fm: "FM Feb", long: "Feb" },
  { short: "Mar", fm: "FM Mar", long: "Mar" },
  { short: "Apr", fm: "FM Apr", long: "Apr" },
  { short: "May", fm: "FM May", long: "May" },
  { short: "Jun", fm: "FM Jun", long: "Jun" },
  { short: "Jul", fm: "FM Jul", long: "Jul" },
  { short: "Aug", fm: "FM Ags", long: "Aug" },
  { short: "Sep", fm: "FM Sep", long: "Sep" },
  { short: "Oct", fm: "FM Okt", long: "Oct" },
  { short: "Nov", fm: "FM Nov", long: "Nov" },
  { short: "Dec", fm: "FM Des", long: "Dec" },
];

interface IndicatorSeed {
  segment: HistorySlaSegment;
  kpi: string;
  indicator: string;
  threshold: string;
  valueType: HistorySlaValueType;
  target: number;
}

const percent = (
  segment: HistorySlaSegment,
  kpi: string,
  indicator: string,
  threshold: string,
  target: number,
): IndicatorSeed => ({ segment, kpi, indicator, threshold, valueType: "percent", target });

const count = (
  segment: HistorySlaSegment,
  kpi: string,
  indicator: string,
  threshold: string,
  target: number,
): IndicatorSeed => ({ segment, kpi, indicator, threshold, valueType: "count", target });

const REGIONS = [
  "01-SUMBAGUT",
  "10-SUMBAGTENG",
  "02-SUMBAGSEL",
  "03-JABOTABEK INNER",
  "12-JABOTABEK OUTER",
  "04-JAWA BARAT",
  "05-JAWA TENGAH",
  "06-JAWA TIMUR",
  "07-BALINUSRA",
  "08-KALIMANTAN",
  "09-SULAWESI",
  "11-PUMA",
];

const SEEDS: IndicatorSeed[] = [
  count("MBB", "Packet Loss", "PL RAN-TO-CORE >5% NATION WIDE", "5%", 78),
  count("MBB", "Packet Loss", "PL RAN-TO-CORE 1-5% NATION WIDE", "1-5%", 249),
  ...REGIONS.map((region, index) =>
    percent("MBB", "Latency", `LATENCY RAN TO CORE ${region}`, "5 | 10 | 20", 87 + ((index * 7) % 12)),
  ),
  percent("MBB", "Jitter", "JITTER RAN TO CORE NATION WIDE", "5 | 10 | 20", 95.4),
  percent("MBB", "Availability", "AVAILABILITY 4G NATION WIDE", "99.5%", 99.5),
  percent("MBB", "Availability", "AVAILABILITY 5G NATION WIDE", "99%", 99),
  count("MBB", "MTTR", "MTTR CRITICAL NATION WIDE (JAM)", "4 Jam", 4),
  percent("MBB", "Accessibility", "CSSR VOLTE NATION WIDE", "98%", 98),

  ...[1, 2, 3, 4, 5, 6, 7].map((treg) =>
    percent("FBB", "Latency", `LATENCY FBB TREG ${treg}`, "20 ms", 93 + ((treg * 3) % 6)),
  ),
  percent("FBB", "Packet Loss", "PACKET LOSS FBB NATION WIDE", "1%", 97.5),
  percent("FBB", "Jitter", "JITTER FBB NATION WIDE", "10 ms", 96.2),
  percent("FBB", "Availability", "AVAILABILITY OLT NATION WIDE", "99.7%", 99.7),
  count("FBB", "MTTR", "TTR GAMAS FBB (JAM)", "6 Jam", 6),
  percent("FBB", "Throughput", "SPEEDTEST INDIHOME NATION WIDE", "90%", 90),
  percent("FBB", "Availability", "AVAILABILITY WIFI.ID NATION WIDE", "98%", 98),

  percent("OLO", "Latency", "LATENCY OLO TSEL - XL", "30 ms", 96.5),
  percent("OLO", "Latency", "LATENCY OLO TSEL - IOH", "30 ms", 96.1),
  percent("OLO", "Packet Loss", "PL OLO TSEL - XL", "1%", 98.2),
  percent("OLO", "Packet Loss", "PL OLO TSEL - IOH", "1%", 98.4),
  percent("OLO", "Jitter", "JITTER OLO TSEL - XL", "10 ms", 97.3),
  percent("OLO", "Jitter", "JITTER OLO TSEL - IOH", "10 ms", 97.1),
  percent("OLO", "Availability", "AVAILABILITY INTERKONEKSI OLO", "99.5%", 99.5),
  count("OLO", "MTTR", "MTTR OLO (JAM)", "4 Jam", 4),

  percent("EBIS", "Availability", "AVAILABILITY ASTINET", "99.5%", 99.5),
  percent("EBIS", "Availability", "AVAILABILITY VPN IP", "99.5%", 99.5),
  percent("EBIS", "Availability", "AVAILABILITY METRO-E", "99.7%", 99.7),
  percent("EBIS", "Latency", "LATENCY ASTINET NATION WIDE", "20 ms", 95.8),
  percent("EBIS", "Packet Loss", "PL VPN IP NATION WIDE", "1%", 97.9),
  count("EBIS", "MTTR", "MTTR EBIS K1 (JAM)", "4 Jam", 4),
  count("EBIS", "MTTR", "MTTR EBIS K2 (JAM)", "8 Jam", 8),
  percent("EBIS", "Availability", "SLA DATIN NATION WIDE", "99%", 99),
];

const createRandom = (seed: number) => {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const buildIndicator = (
  seed: IndicatorSeed,
  index: number,
): HistorySlaIndicator => {
  const random = createRandom(index + 1);

  const quarters = [0, 1, 2, 3].map((quarter) => {
    const target =
      seed.valueType === "count"
        ? Math.max(1, Math.round(seed.target * (1 - quarter * 0.05)))
        : round(Math.min(99.9, seed.target + quarter * 0.3));

    const months = MONTHS.slice(quarter * 3, quarter * 3 + 3).map((month) => {
      const value =
        seed.valueType === "count"
          ? Math.max(0, Math.round(target * (0.85 + random() * 0.45)))
          : round(Math.min(100, target + (random() * 4 - 1.2)));

      return {
        label: month.fm,
        value,
        achieved: seed.valueType === "count" ? value <= target : value >= target,
      };
    });

    return { label: `Q${quarter + 1} ${YEAR}`, target, months };
  });

  return {
    no: index + 1,
    segment: seed.segment,
    kpi: seed.kpi,
    indicator: seed.indicator,
    threshold: seed.threshold,
    value_type: seed.valueType,
    quarters,
  };
};

const SEGMENTS: HistorySlaSegment[] = ["MBB", "FBB", "OLO", "EBIS"];
const PERIOD_MONTH_INDEX = 5;

const indicators = SEEDS.map(buildIndicator);

const isNotAchieved = (indicator: HistorySlaIndicator, monthIndex: number) =>
  !indicator.quarters[Math.floor(monthIndex / 3)].months[monthIndex % 3]
    .achieved;

const countNotAchieved = (monthIndex: number, segment?: HistorySlaSegment) =>
  indicators.filter(
    (indicator) =>
      (!segment || indicator.segment === segment) &&
      isNotAchieved(indicator, monthIndex),
  ).length;

const trend: HistorySlaTrendPoint[] = MONTHS.map((month, index) => ({
  month: month.short,
  period: `${month.long} ${YEAR}`,
  total: countNotAchieved(index),
  segments: Object.fromEntries(
    SEGMENTS.map((segment) => [segment, countNotAchieved(index, segment)]),
  ) as Record<HistorySlaSegment, number>,
}));

export const HISTORY_SLA_DUMMY: HistorySlaData = {
  year: YEAR,
  period: `${MONTHS[PERIOD_MONTH_INDEX].long} ${YEAR}`,
  total_not_achieved: countNotAchieved(PERIOD_MONTH_INDEX),
  total_kpi: indicators.length,
  segments: SEGMENTS.map((segment) => ({
    segment,
    not_achieved: countNotAchieved(PERIOD_MONTH_INDEX, segment),
    total: indicators.filter((indicator) => indicator.segment === segment)
      .length,
  })),
  trend,
  indicators,
};
