import type {
  ActionPlanEntry,
  RcaRegionProgress,
  RcaSiteRow,
  ResumeRcaMonthWeekOption,
  ResumeRcaWeekOption,
} from "@/app/types/resume-rca/resumeRca.types";

/** Region dipakai sebagai urutan baris tetap pada tabel Resume RCA. */
export const RCA_TRAFFIC_REGIONS = [
  "SUMBAGUT",
  "SUMBAGSEL",
  "JABOTABEK_INNER",
  "JAWA_BARAT",
  "JAWA_TENGAH",
  "JAWA_TIMUR",
  "BALI_NUSRA",
  "KALIMANTAN",
  "SULAWESI",
  "SUMBAGTENG",
  "PUMA",
  "JABOTABEK_OUTER",
] as const;

export const RCA_MTTR_REGIONS = [
  "SUMBAGUT",
  "SUMBAGSEL",
  "JABOTABEK INNER",
  "JAWA BARAT",
  "JAWA TENGAH",
  "JAWA TIMUR",
  "BALINUSRA",
  "KALIMANTAN",
  "SULAWESI",
  "SUMBAGTENG",
  "PUMA",
  "JABOTABEK OUTER",
] as const;

/** Kolom RCA pada tabel "RCA Ticket Not Clear" (MTTRq). */
export const RCA_NOT_CLEAR_COLUMNS = [
  { key: "SPMS", label: "SPMS", group: "Sow TIF" },
  { key: "ISR", label: "ISR", group: "Sow TIF" },
  { key: "TRANSPORT", label: "Transport", group: "Sow TIF" },
  { key: "QE", label: "QE", group: "Sow TIF" },
  { key: "COMCASE", label: "Comcase", group: "Sow TIF" },
  { key: "CERAGON", label: "Ceragon", group: "Sow TIF" },
  { key: "LATE RESPON", label: "Late Respon", group: "Sow TIF" },
  { key: "WARRANTY", label: "Warranty", group: "Sow TELKOM" },
  { key: "ISSUE DWS", label: "Issue DWS", group: "Sow TELKOM" },
  { key: "ISSUE TSEL", label: "Issue TSEL", group: "Sow TSEL" },
  { key: "WAITING CRA/CRQ", label: "Waiting CRA/CRQ", group: "Sow TSEL" },
] as const;

/** Urutan label pada chart "RCA Ticket Not Clear". */
export const RCA_NOT_CLEAR_CHART_KEYS = [
  "SPMS",
  "ISR",
  "TRANSPORT",
  "QE",
  "COMCASE",
  "CERAGON",
  "LATE RESPONSE",
  "ISSUE DWS",
  "ISSUE TSEL",
  "WARRANTY",
  "WAITING CRA/CRQ",
] as const;

export const RCA_NOT_CLEAR_CHART_LABELS = [
  "SPMS",
  "ISR",
  "TRANSPORT",
  "QE",
  "COMCASE",
  "CERAGON",
  "LATE RESPON",
  "WARRANTY",
  "ISSUE DWS",
  "ISSUE TSEL",
  "WAITING CRA/CRQ",
] as const;

export const MONTH_OPTIONS = [
  { month: 1, name: "January" },
  { month: 2, name: "February" },
  { month: 3, name: "March" },
  { month: 4, name: "April" },
  { month: 5, name: "May" },
  { month: 6, name: "June" },
  { month: 7, name: "July" },
  { month: 8, name: "August" },
  { month: 9, name: "September" },
  { month: 10, name: "October" },
  { month: 11, name: "November" },
  { month: 12, name: "December" },
];

export const formatYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/** Minggu TWAMP dihitung mulai hari Jumat. */
export const getFriday = (date: string | number | Date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day >= 5 ? day - 5 : day + 2;

  current.setDate(current.getDate() - diff);

  return current;
};

export const getWeekNumberFriday = (date: string | number | Date): number => {
  const current = new Date(date);
  const year = current.getFullYear();
  const jan1 = new Date(year, 0, 1);

  const firstFriday = new Date(jan1);
  firstFriday.setDate(jan1.getDate() + ((5 - jan1.getDay() + 7) % 7));

  if (current < firstFriday) {
    return getWeekNumberFriday(new Date(year - 1, 11, 31));
  }

  const daysDiff = Math.floor(
    (current.getTime() - firstFriday.getTime()) / (1000 * 60 * 60 * 24),
  );

  return Math.floor(daysDiff / 7) + 1;
};

export const generate52Weeks = (
  maxYear = 0,
  maxWeek = 0,
  totalWeeks = 52,
  today = new Date(),
): ResumeRcaWeekOption[] => {
  const result: ResumeRcaWeekOption[] = [];
  const currentFriday = getFriday(today);

  const cursor = new Date(currentFriday);
  cursor.setDate(cursor.getDate() - (totalWeeks - 1) * 7);

  while (cursor <= currentFriday) {
    const start = new Date(cursor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const isBeyondMax =
      start.getFullYear() === maxYear && getWeekNumberFriday(start) > maxWeek;

    if (!isBeyondMax) {
      result.push({
        year: start.getFullYear(),
        week: getWeekNumberFriday(start),
        start: formatYmd(start),
        end: formatYmd(end),
      });
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return result.reverse();
};

/** Minggu tiket MTTRq dihitung Kamis–Rabu, ditutup opsi "FM" (full month). */
export const generateWeeksByMonth = (
  year: number,
  month: number,
): ResumeRcaMonthWeekOption[] => {
  const result: ResumeRcaMonthWeekOption[] = [];

  const jan1 = new Date(year, 0, 1);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  const firstThursday = new Date(jan1);
  firstThursday.setDate(firstThursday.getDate() + ((4 - firstThursday.getDay() + 7) % 7));

  const cursor = new Date(firstThursday);
  let week = 1;

  while (cursor <= lastDayOfMonth) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setDate(start.getDate() + 6);

    if (end >= firstDayOfMonth && start <= lastDayOfMonth) {
      result.push({
        year,
        month,
        week,
        label: `W${week}`,
        start: formatYmd(start < firstDayOfMonth ? firstDayOfMonth : start),
        end: formatYmd(end > lastDayOfMonth ? lastDayOfMonth : end),
      });
    }

    week += 1;
    cursor.setDate(cursor.getDate() + 7);
  }

  result.push({
    year,
    month,
    week: "FM",
    label: "FM",
    start: formatYmd(firstDayOfMonth),
    end: formatYmd(lastDayOfMonth),
  });

  return result;
};

export const getInitialWeekSelection = () => {
  const todayFriday = getFriday(new Date());

  return `${getWeekNumberFriday(todayFriday)}-${todayFriday.getFullYear()}`;
};

export const formatRcaNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

export const isMttrParameter = (parameter: string) => parameter.includes("MTTR");

/** Nama region pada API memakai spasi, key tabel memakai underscore. */
export const toRegionKey = (region: string) => region.replace("_", " ");

/**
 * Hitung ringkasan per region: total site not clear, jumlah tiket per label RCA,
 * dan persentase progress (CLOSED / (CLOSED + OGP)).
 */
export const buildRegionProgress = (
  table: { progress: Record<string, RcaSiteRow[]>; sites: Record<string, RcaSiteRow[]> },
  labels: string[],
): Record<string, RcaRegionProgress> => {
  const result: Record<string, RcaRegionProgress> = {};

  RCA_TRAFFIC_REGIONS.forEach((region) => {
    const key = toRegionKey(region);
    const sites = table.sites[key] ?? [];
    const progress = table.progress[key] ?? [];

    const row: RcaRegionProgress = { total_site: sites.length };

    labels.forEach((label) => {
      const lower = label.toLowerCase();

      row[`t_${lower}`] = sites.filter((site) => site.rca === label).length;

      const closed = progress.filter(
        (item) => item.rca === label && item.status === "CLOSED",
      ).length;
      const ogp = progress.filter(
        (item) => item.rca === label && item.status === "OGP",
      ).length;

      row[`p_${lower}`] =
        closed + ogp > 0 ? (closed / (closed + ogp)) * 100 : 0;
    });

    result[region] = row;
  });

  return result;
};

/** Total site not clear seluruh region. */
export const sumTotalSites = (sites: Record<string, RcaSiteRow[]>) =>
  Object.values(sites).reduce((total, rows) => total + rows.length, 0);

export const sumRegionValues = (
  progress: Record<string, RcaRegionProgress>,
  field: string,
) =>
  Object.values(progress).reduce(
    (total, row) => total + (Number(row[field]) || 0),
    0,
  );

/** Rata-rata progress hanya menghitung region yang punya nilai. */
export const averageRegionProgress = (
  progress: Record<string, RcaRegionProgress>,
  field: string,
) => {
  const values = Object.values(progress).map((row) => Number(row[field]) || 0);
  const counted = values.filter((value) => value !== 0).length;

  if (!counted) return 0;

  return values.reduce((total, value) => total + value, 0) / counted;
};

/** Ambil daftar site untuk popup, difilter region dan/atau label RCA. */
export const collectSites = (
  sites: Record<string, RcaSiteRow[]>,
  region: string,
  rca: string,
) => {
  const source =
    region === "nationwide"
      ? Object.values(sites).flat()
      : (sites[region] ?? []);

  return rca ? source.filter((site) => site.rca === rca) : source;
};

/** Site untuk popup dari klik chart: filter label RCA + status (OGP/Close). */
export const collectSitesByStatus = (
  sites: Record<string, RcaSiteRow[]>,
  rca: string,
  status: string,
) =>
  Object.values(sites)
    .flat()
    .filter(
      (site) =>
        site.rca === rca &&
        String(site.status ?? "")
          .toUpperCase()
          .includes(status.toUpperCase()),
    );

/** Site untuk popup Action Plan: filter RCA level 1/2, status, dan region. */
export const collectActionPlanSites = (
  sites: Record<string, RcaSiteRow[]>,
  { rca, rca2, status }: { rca: string; rca2: string; status: string },
) =>
  Object.values(sites)
    .flat()
    .filter((site) => {
      if (site.rca !== rca) return false;
      if (rca2 && site.rca2 !== rca2) return false;

      return (
        String(site.status ?? "").toUpperCase() === status.toUpperCase()
      );
    });

/** Total OGP/CLOSED satu action plan (dijumlah dari semua region). */
export const sumActionPlanEntry = (
  entry: ActionPlanEntry | undefined,
  status: "OGP" | "CLOSED",
) =>
  Object.values(entry?.[status] ?? {}).reduce(
    (total, value) => total + (Number(value) || 0),
    0,
  );
