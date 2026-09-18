import type {
  TicketSeverity,
  TicketTtrSlice,
} from "@/app/types/ticket/ticketQuality.types";

export const TICKET_SEVERITY_COLOR: Record<TicketSeverity, string> = {
  critical: "#ef4444",
  major: "#f59e0b",
  minor: "#22c55e",
};

export const TICKET_TTR_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

export const TICKET_TREND_COLORS = {
  jawa: "#2563eb",
  nonJawa: "#ec4899",
} as const;

/** Persen dengan koma sebagai desimal, sesuai format laporan (mis. `89,30%`). */
export const formatTicketPercent = (value: number, fractionDigits = 2) =>
  `${value.toFixed(fractionDigits).replace(".", ",")}%`;

/** Achievement ditulis satu desimal dan `100%` tanpa desimal. */
export const formatTicketAchievement = (value: number) =>
  value >= 100 ? "100%" : `${value.toFixed(1)}%`;

/** Selisih Month-over-Month: tanda panah ikut arah nilainya. */
export const formatMomDelta = (value: number) =>
  `${value >= 0 ? "↑" : "↓"} ${Math.abs(value)} MoM`;

export const isTicketAchieved = (achievement: number, target = 100) =>
  achievement >= target;

/**
 * Warna region pada peta: gradasi hijau→kuning→merah mengikuti jumlah tiket
 * terbuka relatif terhadap rentang `min`–`max`.
 */
export const getTicketHeatColor = (
  value: number,
  min: number,
  max: number,
): string => {
  if (!Number.isFinite(value)) return "#cbd5e1";
  if (max <= min) return "#22c55e";

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));

  if (ratio < 0.5) return mixHex("#22c55e", "#facc15", ratio / 0.5);

  return mixHex("#facc15", "#ef4444", (ratio - 0.5) / 0.5);
};

const mixHex = (from: string, to: string, ratio: number) => {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);

  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * ratio)
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
};

export const withTtrColors = (slices: TicketTtrSlice[]) =>
  slices.map((slice, index) => ({
    ...slice,
    color: TICKET_TTR_COLORS[index % TICKET_TTR_COLORS.length],
  }));
