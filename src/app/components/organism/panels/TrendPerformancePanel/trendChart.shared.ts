import type { TrendScope } from "@/app/types/monday/trendQuality.types";

export const METRIC_OPTIONS = [
  { label: "Latency", value: "latency" },
  { label: "Packet Loss", value: "packetloss" },
  { label: "Jitter", value: "jitter" },
];

/** Sama seperti tombol NATION/TERITORY/TREG/REGION di monday monitoring lama. */
export const SCOPE_OPTIONS: { label: string; value: TrendScope }[] = [
  { label: "Nation", value: "nation" },
  { label: "Teritory", value: "area" },
  { label: "Treg", value: "region" },
  { label: "Region", value: "region_tsel" },
];

/** Cukup untuk 12 region; warna diulang kalau serinya lebih banyak. */
export const SERIES_COLORS = [
  "#3B82F6",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#0EA5E9",
  "#A855F7",
];

/** "01-sumbagut" -> "01-Sumbagut", "AREA 1" -> "Area 1". */
export const formatSeriesName = (name: string) =>
  name
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, prefix: string, letter: string) =>
      `${prefix}${letter.toUpperCase()}`,
    );
