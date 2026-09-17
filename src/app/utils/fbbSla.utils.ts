// Types
import type { SlaWsaItem } from "@/app/types/fbb/sla.types";

/** Indikator dianggap mencapai target saat capaian minimal 100%. */
export const SLA_ACHIEVEMENT_THRESHOLD = 100;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "137.5%" -> 137.5. Mengembalikan null kalau API mengirim format lain. */
export const parseAchievement = (capaian?: string) => {
  if (!capaian) return null;

  const numeric = Number(String(capaian).replace("%", "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
};

/** Angka dari API dikirim sebagai string, mis. "33.102492" -> "33,10". */
export const formatDecimal = (value?: string) => {
  if (value === undefined || value === null || value === "") return "-";

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;

  return numeric.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** "137.5%" -> "137,5%" biar seragam dengan format angka lain di tabel. */
export const formatAchievementLabel = (capaian?: string) => {
  const numeric = parseAchievement(capaian);
  if (numeric === null) return capaian ?? "-";

  return `${numeric.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

/** "202635" -> "W35 2026" */
export const formatYearWeek = (yearweek?: string | number) => {
  const raw = String(yearweek ?? "");
  if (raw.length !== 6) return raw || "-";

  return `W${Number(raw.slice(4))} ${raw.slice(0, 4)}`;
};

/** "202635" -> "W35'26", dipakai di judul kolom biar tidak kepanjangan. */
export const formatYearWeekShort = (yearweek?: string | number) => {
  const raw = String(yearweek ?? "");
  if (raw.length !== 6) return raw || "-";

  return `W${Number(raw.slice(4))}'${raw.slice(2, 4)}`;
};

/** "2026-08-07" -> "07 Agu 2026" */
export const formatFbbDate = (date?: string) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  const monthLabel = MONTH_LABELS[Number(month) - 1];
  if (!monthLabel) return date;

  return `${day} ${monthLabel} ${year}`;
};

/** Judul periode diambil dari rentang tanggal yang dikirim API. */
export const buildPeriodLabel = (rows: SlaWsaItem[], yearweek?: string) => {
  const week = formatYearWeek(rows[0]?.yearweek ?? yearweek);
  const start = formatFbbDate(rows[0]?.date_start);
  const end = formatFbbDate(rows[0]?.date_end);

  if (!start || !end) return `Pencapaian Terakhir Period ${week}`;

  return `Pencapaian Terakhir Period ${week} (${start} - ${end})`;
};

/** Ringkasan jumlah indikator yang tercapai dan tidak, dipakai kartu ringkasan. */
export const summarizeAchievements = (rows: SlaWsaItem[]) => {
  const achievements = rows
    .map((row) => parseAchievement(row.capaian))
    .filter((value): value is number => value !== null);

  const achieved = achievements.filter(
    (value) => value >= SLA_ACHIEVEMENT_THRESHOLD,
  ).length;

  return {
    total: rows.length,
    achieved,
    notAchieved: achievements.length - achieved,
  };
};

/**
 * Parameter untuk endpoint detail region/kabupaten. API memakai kata kunci
 * seperti "latency", "packetloss", atau "jitter"; nilainya diambil dari kolom
 * `parameter`, dan kalau tidak cocok dicari dari nama indikator.
 */
export const resolveSlaParameter = (row?: {
  parameter?: string;
  performance_indicator?: string;
} | null) => {
  const source = `${row?.parameter ?? ""} ${row?.performance_indicator ?? ""}`
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (source.includes("packetloss")) return "packetloss";
  if (source.includes("latency")) return "latency";
  if (source.includes("jitter")) return "jitter";

  return String(row?.parameter ?? "").trim().toLowerCase();
};

/**
 * Nilai detail region/kabupaten dipotong (bukan dibulatkan) di 2 angka belakang
 * koma, supaya 0.99664 tetap terbaca 0,99 dan tidak berubah jadi 1,00.
 */
export const formatSlaDetailValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return "-";

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);

  const truncated = Math.trunc(numeric * 100) / 100;

  return truncated.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
