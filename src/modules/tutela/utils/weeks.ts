import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isLeapYear from "dayjs/plugin/isLeapYear";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";

dayjs.extend(isoWeek);
dayjs.extend(isLeapYear);
dayjs.extend(isoWeeksInYear);

/**
 * Generate a list of recent ISO yearweeks (e.g. ["202635", "202634", ...])
 * going back `count` weeks from the current date.
 */
export const generateFallbackWeeks = (count = 52): string[] => {
  const list: string[] = [];
  let d = dayjs();
  for (let i = 0; i < count; i++) {
    const year = d.isoWeekYear();
    const week = String(d.isoWeek()).padStart(2, "0");
    const yw = `${year}${week}`;
    if (!list.includes(yw)) {
      list.push(yw);
    }
    d = d.subtract(1, "week");
  }
  return list;
};

/**
 * Format a yearweek string/number into human-readable label.
 * e.g. "202634" -> "W34 - 2026"
 */
export const formatWeekLabel = (w: string | number | null | undefined): string => {
  const str = String(w ?? "").trim();
  if (str.length === 6 && !isNaN(Number(str))) {
    return `W${str.slice(4)} - ${str.slice(0, 4)}`;
  }
  return str || "-";
};

/**
 * Safely extract and sort yearweek strings descending from API responses.
 * Handles arrays, wrapped objects ({ data: [...] }, { result: [...] }, etc.),
 * and falls back to generated recent weeks if the API response is empty/invalid.
 */
export const extractWeeks = (data: any): string[] => {
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data?.rows)
    ? data.rows
    : [];

  const parsed = rawList
    .map((w: any) => {
      if (typeof w === "string" || typeof w === "number") {
        return String(w).trim();
      }
      return String(w?.yearweek ?? w?.yearWeek ?? w?.week ?? "").trim();
    })
    .filter((w: string) => w.length === 6 && !isNaN(Number(w)))
    .sort((a: string, b: string) => b.localeCompare(a));

  const unique = Array.from(new Set(parsed));

  if (unique.length > 0) {
    return unique;
  }

  // Fallback to recent 52 weeks if API response is empty or failed
  return generateFallbackWeeks(52);
};

/**
 * Extract granularity-to-time mapping from v-onx-last-period-time endpoint.
 */
export const extractPeriodDefaults = (periodData: any): Record<string, string> => {
  const defaults: Record<string, string> = {};
  const rawList = Array.isArray(periodData)
    ? periodData
    : Array.isArray(periodData?.data)
    ? periodData.data
    : Array.isArray(periodData?.result)
    ? periodData.result
    : [];

  rawList.forEach((item: any) => {
    if (item && item.granularity && item.time) {
      const isMob =
        item.isMobile === true ||
        item.isMobile === "true" ||
        item.isMobile === 1 ||
        item.is_mobile === true ||
        item.is_mobile === 1 ||
        item.isMobile === undefined;

      const gran = String(item.granularity).trim();
      const timeVal = String(item.time).trim();

      if (isMob) {
        defaults[gran] = timeVal;
        defaults[gran.replace(" ", "")] = timeVal;
      }
      // Set general default if not set yet
      if (!defaults[gran]) {
        defaults[gran] = timeVal;
        defaults[gran.replace(" ", "")] = timeVal;
      }
    }
  });

  return defaults;
};

/**
 * Find the week that is `offset` periods prior in `weeksList`,
 * or calculate it safely via dayjs across year boundaries.
 */
export const getPriorWeek = (
  weeksList: string[],
  targetWeek: string,
  offset = 4
): string => {
  if (!targetWeek) {
    return weeksList.length > offset
      ? weeksList[offset]
      : weeksList[0] || "";
  }

  const idx = weeksList.indexOf(targetWeek);
  if (idx !== -1) {
    const targetIdx = Math.min(idx + offset, weeksList.length - 1);
    return weeksList[targetIdx];
  }

  // Fallback: parse year and week if not in list
  if (targetWeek.length === 6 && !isNaN(Number(targetWeek))) {
    const y = parseInt(targetWeek.slice(0, 4), 10);
    const w = parseInt(targetWeek.slice(4), 10);
    const d = dayjs().year(y).isoWeek(w).subtract(offset, "week");
    return `${d.isoWeekYear()}${String(d.isoWeek()).padStart(2, "0")}`;
  }

  return targetWeek;
};

/**
 * Resolves ONX API URLs, applying VITE_ONX_API_BASE_URL if configured.
 */
export const resolveOnxUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_ONX_API_BASE_URL;
  if (!baseUrl) return path;

  if (path.startsWith("/onx-api")) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const subPath = path.replace(/^\/onx-api/, "");
    return `${cleanBase}${subPath}`;
  }

  return path;
};
