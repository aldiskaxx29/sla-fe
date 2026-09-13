// Types
import type { SlaWsaItem } from "@/app/types/fbb/sla.types";

/**
 * Data contoh KPI Enterprise. Endpoint-nya belum ada, jadi halaman ini masih
 * memakai angka statis dengan bentuk yang sama seperti SLA WISA FBB supaya
 * tabelnya bisa langsung dipakai bersama.
 */
interface SampleIndicator {
  segmen: string;
  indicator: string;
  layanan: string;
  satuan: string;
  sumber: string;
  target: number;
  value: number;
  /** Makin kecil makin bagus, mis. latency dan MTTR. */
  lowerIsBetter?: boolean;
}

const SAMPLE_INDICATORS: SampleIndicator[] = [
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Service Availability (*)",
    layanan: "VPN IP",
    satuan: "%",
    sumber: "NOSS",
    target: 99.5,
    value: 99.82,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Latency Domestic (*)",
    layanan: "VPN IP",
    satuan: "ms",
    sumber: "Probe Nasional",
    target: 30,
    value: 24.6,
    lowerIsBetter: true,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Packet Loss Domestic (*)",
    layanan: "VPN IP",
    satuan: "%",
    sumber: "Probe Nasional",
    target: 0.5,
    value: 0.32,
    lowerIsBetter: true,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-MTTR Gold (*)",
    layanan: "Metro Ethernet",
    satuan: "jam",
    sumber: "Ticketing",
    target: 4,
    value: 4.6,
    lowerIsBetter: true,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-MTTR Silver (*)",
    layanan: "Metro Ethernet",
    satuan: "jam",
    sumber: "Ticketing",
    target: 8,
    value: 6.9,
    lowerIsBetter: true,
  },
  {
    segmen: "Enterprise",
    indicator: "ONM-ENT-Service Availability (*)",
    layanan: "Internet Dedicated",
    satuan: "%",
    sumber: "NOSS",
    target: 99.5,
    value: 99.21,
  },
];

/** Minggu yang tersedia pada data contoh, terbaru di depan. */
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

/**
 * Minggu terbaru memakai angka dasar; minggu sebelumnya digeser ±1,5% supaya
 * ganti filter terlihat efeknya tanpa membuat angkanya jadi tidak masuk akal.
 */
const shiftValue = (indicator: SampleIndicator, weekIndex: number) => {
  if (weekIndex === 0) return indicator.value;

  const shifted = indicator.value * (1 + (((weekIndex * 37) % 7) - 3) / 200);

  // Availability tidak mungkin lewat 100%.
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

/** Baris indikator untuk satu minggu, bentuknya sama dengan respons SLA WISA. */
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
