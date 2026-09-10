import type { SlaWsaItem } from "@/modules/fbb/types/sla.types";

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
export const formatDate = (date?: string) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  const monthLabel = MONTH_LABELS[Number(month) - 1];
  if (!monthLabel) return date;

  return `${day} ${monthLabel} ${year}`;
};

/** Judul periode diambil dari rentang tanggal yang dikirim API. */
export const buildPeriodLabel = (rows: SlaWsaItem[], yearweek?: string) => {
  const week = formatYearWeek(rows[0]?.yearweek ?? yearweek);
  const start = formatDate(rows[0]?.date_start);
  const end = formatDate(rows[0]?.date_end);

  if (!start || !end) return `Pencapaian Terakhir Period ${week}`;

  return `Pencapaian Terakhir Period ${week} (${start} - ${end})`;
};
