import type { SlaWsaItem } from "@/app/types/fbb/sla.types";

interface SampleIndicator {
  segmen: string;
  indicator: string;
  layanan: string;
  satuan: string;
  sumber: string;
  target: number;
  value: number;
  lowerIsBetter?: boolean;
}

const SAMPLE_INDICATORS: SampleIndicator[] = [
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Compliance Jitter 10ms",
    layanan: "Datin Astinet",
    satuan: "%",
    sumber: "Netmonk Astinet",
    target: 97,
    value: 99.81,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Compliance Latency 50ms",
    layanan: "Datin Astinet",
    satuan: "%",
    sumber: "Netmonk Astinet",
    target: 97,
    value: 98.76,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Compliance Packet Loss 1%",
    layanan: "Datin Astinet",
    satuan: "%",
    sumber: "Netmonk Astinet",
    target: 95,
    value: 93.86,
  },
];

export const SAMPLE_EBIS_WEEKS = [
  "202635",
  "202634",
  "202633",
  "202632",
  "202631",
];

const WEEK_RANGES: Record<string, { start: string; end: string }> = {
  "202635": { start: "2026-08-28", end: "2026-09-03" },
  "202634": { start: "2026-08-21", end: "2026-08-27" },
  "202633": { start: "2026-08-14", end: "2026-08-20" },
  "202632": { start: "2026-08-07", end: "2026-08-13" },
  "202631": { start: "2026-07-31", end: "2026-08-06" },
};

const shiftValue = (indicator: SampleIndicator, weekIndex: number) => {
  if (weekIndex === 0) return indicator.value;

  const shifted = indicator.value * (1 + (((weekIndex * 37) % 7) - 3) / 200);

  return !indicator.lowerIsBetter && indicator.satuan === "%"
    ? Math.min(shifted, 99.99)
    : shifted;
};

const toCapaian = (indicator: SampleIndicator, value: number) => {
  const ratio = indicator.lowerIsBetter
    ? indicator.target / value
    : value / indicator.target;

  return `${(ratio * 100).toFixed(1)}%`;
};

export const buildSampleEbisKpi = (yearweek: string): SlaWsaItem[] => {
  const weekIndex = Math.max(SAMPLE_EBIS_WEEKS.indexOf(yearweek), 0);
  const range = WEEK_RANGES[yearweek] ?? WEEK_RANGES[SAMPLE_EBIS_WEEKS[0]];

  return SAMPLE_INDICATORS.map((indicator) => {
    const value = shiftValue(indicator, weekIndex);

    return {
      sumber_data: indicator.sumber,
      segmen: indicator.segmen,
      performance_indicator: indicator.indicator,
      layanan: indicator.layanan,
      level: "NATIONAL",
      yearweek,
      date_start: range.start,
      date_end: range.end,
      provider: "Telkom",
      parameter: indicator.indicator,
      satuan: indicator.satuan,
      target: String(indicator.target),
      value: value.toFixed(2),
      capaian: toCapaian(indicator, value),
    };
  });
};
