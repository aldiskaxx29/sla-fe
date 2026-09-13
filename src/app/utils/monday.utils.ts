// Dayjs
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Periode pengukuran satu minggu berjalan Jumat s/d Kamis — sama seperti
 * label di monday monitoring lama, mis. Week 34 = 21 s/d 27 Agustus 2026,
 * sedangkan minggu ISO-nya sendiri mulai Senin 17 Agustus.
 */
const WEEK_START_OFFSET_DAYS = 4;

const formatDate = (date: dayjs.Dayjs) =>
  `${date.date()} ${MONTH_NAMES[date.month()]} ${date.year()}`;

/** "202624" -> "Week 24 (12 Juni 2026 - 18 Juni 2026)" */
export const formatMondayWeekLabel = (yearWeek?: string | null) => {
  const raw = String(yearWeek ?? "");
  const year = Number(raw.slice(0, 4));
  const week = Number(raw.slice(4));

  if (!raw || !Number.isFinite(year) || !Number.isFinite(week)) return "";

  const start = dayjs()
    .year(year)
    .isoWeek(week)
    .startOf("isoWeek")
    .add(WEEK_START_OFFSET_DAYS, "day");
  const end = start.add(6, "day");

  return `Week ${week} (${formatDate(start)} - ${formatDate(end)})`;
};

/**
 * Jam pada judul Monitoring CTI/ONX: jam berjalan dibulatkan ke awal jam,
 * mis. "09:00" — sama seperti `updateClock()` di monday monitoring lama.
 */
export const formatMonitoringHour = (date: Date = new Date()) =>
  `${String(date.getHours()).padStart(2, "0")}:00`;
