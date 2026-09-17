import type { MsaRow } from "@/app/types/msa/msa.types";

const MONTH_PREFIXES: Array<[string, number]> = [
  ["jan", 1],
  ["feb", 2],
  ["mar", 3],
  ["apr", 4],
  ["mei", 5],
  ["may", 5],
  ["jun", 6],
  ["jul", 7],
  ["agu", 8],
  ["aug", 8],
  ["sep", 9],
  ["okt", 10],
  ["oct", 10],
  ["nov", 11],
  ["des", 12],
  ["dec", 12],
];

export const MONTH_SHORT_LABELS = [
  "",
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

export const MONTH_LONG_LABELS = [
  "",
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUSTUS",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

/** Bulan dengan 5 minggu pada kalender laporan MSA. */
const FIVE_WEEK_MONTHS = [3, 6, 8, 11];

export const getWeekCountOfMonth = (monthNum: number) =>
  FIVE_WEEK_MONTHS.includes(monthNum) ? 5 : 4;

export const monthLabelToNumber = (label?: string): number => {
  if (!label) return 0;

  const lower = label.toLowerCase();
  const found = MONTH_PREFIXES.find(([prefix]) => lower.startsWith(prefix));

  return found ? found[1] : 0;
};

/** Nama parameter di UI dipetakan ke `parameter_key` milik backend WISA. */
export const mapParameterToKey = (parameter?: string): string => {
  if (!parameter) return "";

  const upper = parameter.toUpperCase().trim();

  if (upper.includes("PACKETLOSS >5%")) return "packetloss_5";
  if (upper.includes("PACKETLOSS 1-5%")) return "packetloss_15";
  if (upper.includes("PACKETLOSS CORE TO INTERNET"))
    return "packetloss_internet";
  if (upper.includes("PACKETLOSS")) return "packetloss";
  if (upper.includes("JITTER CORE TO INTERNET")) return "jitter_internet";
  if (upper.includes("JITTER")) return "jitter";
  if (upper.includes("LATENCY CORE TO INTERNET")) return "latency_internet";
  if (upper.includes("LATENCY")) return "latency";
  if (upper.includes("MTTRQ") && upper.includes("MAJOR")) return "mttrq_major";
  if (upper.includes("MTTRQ") && upper.includes("MINOR")) return "mttrq_minor";
  if (upper.includes("MTTRQ") && upper.includes("CRITICAL"))
    return "mttrq_critical";

  const lower = parameter.toLowerCase();

  if (lower.includes("packetloss_5")) return "packetloss_5";
  if (lower.includes("packetloss_15")) return "packetloss_15";
  if (lower.includes("jitter")) return "jitter";
  if (lower.includes("latency")) return "latency";
  if (lower.includes("mttrq_major")) return "mttrq_major";
  if (lower.includes("mttrq_minor")) return "mttrq_minor";
  if (lower.includes("mttrq_critical")) return "mttrq_critical";

  return lower.replace(/\s+/g, "_");
};

/** Kode `type` untuk endpoint detail site per minggu. */
export const mapKpiToSiteTypeCode = (kpi?: string): string => {
  if (!kpi) return "";

  const lower = kpi.toLowerCase();

  if (lower.includes("1-5%")) return "p15";
  if (lower.includes(">5%")) return "p5";
  if (lower.includes("latency") && lower.includes("internet"))
    return "latency_internet";
  if (lower.includes("latency")) return "latency";
  if (lower.includes("jitter") && lower.includes("internet"))
    return "jitter_internet";
  if (lower.includes("jitter")) return "jitter";
  if (lower.includes("packetloss") && lower.includes("internet"))
    return "packetloss_internet";
  if (lower.includes("packetloss")) return "packetloss";
  if (lower.includes("mttr") && lower.includes("major")) return "mttr_major";
  if (lower.includes("mttr") && lower.includes("minor")) return "mttr_minor";
  if (lower.includes("mttr") && lower.includes("critical"))
    return "mttr_critical";

  return kpi;
};

export const mapTregToArea = (treg?: string): string => {
  if (!treg) return "ALL";

  const lower = treg.toLowerCase().trim();

  if (lower === "all") return "ALL";
  if (/^treg[1-4]$/.test(lower)) return `AREA ${lower.replace("treg", "")}`;

  return treg.toUpperCase();
};

export const normalizeWilayah = (value?: string): string => {
  if (!value) return "NON JAWA";

  const upper = value.toUpperCase().trim();
  const isJawaFamily = upper.includes("JAWA") || upper.includes("JVM");

  if (upper.includes("NON") && isJawaFamily) return "NON JAWA";
  if (isJawaFamily) return "JAWA";

  return upper;
};

export const isWilayahRow = (value?: string) => {
  const lower = value?.toLowerCase().trim();

  return lower === "jawa" || lower === "non jawa" || lower === "jvm";
};

export const isMttrqParameter = (value?: string) =>
  Boolean(value?.toLowerCase().includes("mttrq"));

/** Response bisa berupa array, atau objek `{ jawa, non_jawa }`. */
export const flattenMsaData = (data: unknown): MsaRow[] => {
  if (Array.isArray(data)) return data as MsaRow[];
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  const combined: MsaRow[] = [];

  ["jawa", "non_jawa", "non-jawa"].forEach((key) => {
    if (Array.isArray(record[key])) combined.push(...(record[key] as MsaRow[]));
  });

  if (combined.length) return combined;

  Object.values(record).forEach((value) => {
    if (Array.isArray(value)) combined.push(...(value as MsaRow[]));
  });

  return combined;
};

const assignMonthFields = (
  target: Record<string, unknown>,
  monthData: Record<string, unknown> | undefined,
  monthNum: number,
) => {
  if (monthNum <= 0 || !monthData) return;

  target[`ach_fm_${monthNum}`] = monthData.achievement;
  target[`score_fm_${monthNum}`] = monthData.score;
  target[`realisasi_fm_before_${monthNum}`] = monthData.before;
  target[`realisasi_fm_after_${monthNum}`] = monthData.after;

  if (!Array.isArray(monthData.weekly)) return;

  (monthData.weekly as Record<string, unknown>[]).forEach((week) => {
    target[`ach_${monthNum}_${week.week_month}_${week.week_year}`] = week.value;
    target[`ach_${monthNum}_${week.week_month}`] = week.value;
  });
};

/**
 * Response WISA yang baru dipetakan ke bentuk lama (`ach_fm_<bulan>`,
 * `ach_<bulan>_<minggu>`) supaya kolom tabel MSA tetap bisa dibangun dinamis.
 */
export const mapMsaRows = (
  data: unknown,
  level: "nation" | "region" | "witel",
): MsaRow[] =>
  flattenMsaData(data).map((rawRow) => {
    const row = rawRow as Record<string, unknown>;

    const parameter =
      level === "region"
        ? row.region
        : level === "witel"
          ? row.witel
          : row.parameter_label || row.parameter_key || "";

    const mapped: Record<string, unknown> = {
      parameter,
      target: row.target,
      satuan: row.satuan,
      weight: row.weight,
      score_before_rekon: row.score_before_rekon,
      score_after_rekon: row.score_after_rekon,
      year: row.tahun,
    };

    Object.entries(row).forEach(([key, value]) => {
      if (!(key in mapped)) mapped[key] = value;
    });

    const currMonth = row.curr_month as Record<string, unknown> | undefined;
    const prevMonth = row.prev_month as Record<string, unknown> | undefined;

    assignMonthFields(
      mapped,
      currMonth,
      monthLabelToNumber(currMonth?.label as string | undefined),
    );
    assignMonthFields(
      mapped,
      prevMonth,
      monthLabelToNumber(prevMonth?.label as string | undefined),
    );

    if (level === "nation") {
      mapped.is_parent = true;
      mapped.main_parent = true;
    } else if (level === "region") {
      mapped.parent = true;
    }

    return mapped;
  });

/**
 * Endpoint weekly-month mengirim satu baris per region dengan `weekly[]`,
 * sedangkan modal realisasi membaca `ach_<bulan>_<minggu>`.
 */
export const mapWeeklyMonthRows = (rows: unknown): MsaRow[] => {
  if (!Array.isArray(rows)) return [];

  return (rows as Record<string, unknown>[]).map((row) => {
    const monthNum = Number(row.bulan) || 0;

    const mapped: Record<string, unknown> = {
      ...row,
      region_tsel: row.region ?? row.region_tsel,
      target: row.target,
    };

    if (monthNum > 0) mapped[`ach_fm_${monthNum}`] = row.achievement;

    if (Array.isArray(row.weekly) && monthNum > 0) {
      (row.weekly as Record<string, unknown>[]).forEach((week) => {
        if (week.week_month === undefined) return;

        mapped[`ach_${monthNum}_${week.week_month}`] = week.value;
        mapped[`ach_${monthNum}_${week.week_month}_${week.week_year}`] =
          week.value;
      });
    }

    return mapped;
  });
};

/**
 * Sebagian response lama hanya mengirim `*_prev`/`*_curr`, jadi dinormalkan ke
 * kunci bernomor bulan agar kolom tabel konsisten.
 */
export const normalizeMsaMonthlyKeys = (rows: MsaRow[]): MsaRow[] => {
  const dashIfEmpty = (value: unknown) =>
    value === "" || value === null || value === undefined ? "-" : value;

  const hasExplicitMonthlyKeys = (row: MsaRow) =>
    Object.keys(row).some((key) => {
      const match = key.match(/^ach_fm_(\d+)$/);

      return Boolean(match && Number(match[1]) > 2);
    });

  const pickFirstValue = (row: MsaRow, keys: string[]) => {
    for (const key of keys) {
      const value = row[key];

      if (value !== undefined && value !== null && value !== "") return value;
    }

    return "-";
  };

  return rows.map((row) => {
    const normalized: Record<string, unknown> = { ...row };

    if (!hasExplicitMonthlyKeys(row)) {
      normalized.ach_fm_1 = dashIfEmpty(
        pickFirstValue(row, ["ach_fm_prev", "ach_fm_prev_2"]),
      );
      normalized.ach_fm_2 = dashIfEmpty(
        pickFirstValue(row, ["ach_fm_curr", "ach_fm_prev_1"]),
      );

      normalized.realisasi_fm_before_1 = dashIfEmpty(
        pickFirstValue(row, [
          "realisasi_fm_before_prev",
          "realisasi_fm_before_prev_2",
        ]),
      );
      normalized.realisasi_fm_after_1 = dashIfEmpty(
        pickFirstValue(row, [
          "realisasi_fm_after_prev",
          "realisasi_fm_after_prev_2",
        ]),
      );
      normalized.realisasi_fm_1 = dashIfEmpty(
        pickFirstValue(row, ["realisasi_fm_prev", "realisasi_fm_prev_2"]),
      );
      normalized.score_fm_1 = dashIfEmpty(
        pickFirstValue(row, ["score_fm_prev", "score_fm_prev_2"]),
      );

      normalized.realisasi_fm_before_2 = dashIfEmpty(
        pickFirstValue(row, [
          "realisasi_fm_before_curr",
          "realisasi_fm_before_prev_1",
        ]),
      );
      normalized.realisasi_fm_after_2 = dashIfEmpty(
        pickFirstValue(row, [
          "realisasi_fm_after_curr",
          "realisasi_fm_after_prev_1",
        ]),
      );
      normalized.realisasi_fm_2 = dashIfEmpty(
        pickFirstValue(row, ["realisasi_fm_curr", "realisasi_fm_prev_1"]),
      );
      normalized.score_fm_2 = dashIfEmpty(
        pickFirstValue(row, ["score_fm_curr", "score_fm_prev_1"]),
      );
    }

    for (let week = 1; week <= 4; week += 1) {
      const sourceKey = `ach_w${week}`;

      normalized[`ach_1_${week}`] = dashIfEmpty(row[sourceKey]);
      normalized[`ach_2_${week}`] = dashIfEmpty(row[sourceKey]);
    }

    return normalized;
  });
};

export const addRowNumbers = (rows: MsaRow[]): MsaRow[] =>
  rows.map((row, index) => {
    const parameter = String(row.parameter ?? "").toLowerCase();
    const isSummaryRow =
      parameter.includes("weighted") || parameter.includes("service ");

    return { ...row, no: isSummaryRow ? null : index + 1 };
  });

export const formatMsaNumber = (value: unknown) => {
  const parsed = parseFloat(String(value));

  if (Number.isNaN(parsed)) return "-";

  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2);
};

export const formatParameterText = (value?: string) =>
  value
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "";

export const formatWeekMonthLabel = (value?: string) => {
  if (!value) return "";

  const match = value.match(/week_(\d+)_(\d+)/i);

  if (!match) return value.replace(/_/g, " ");

  const monthNum = Number(match[1]);
  const weekNum = Number(match[2]);

  return `${MONTH_LONG_LABELS[monthNum] ?? monthNum} Week ${weekNum}`;
};

export const WEEKLY_KPI_OPTIONS = [
  "packetloss 1-5% ran to core",
  "packetloss >5% ran to core",
  "latency",
  "jitter",
  "packetloss_internet",
  "latency_internet",
  "jitter_internet",
  "mttrq_major",
  "mttrq_minor",
  "mttrq_critical",
];

export const formatWeeklyKpiLabel = (option: string) => {
  const labels: Record<string, string> = {
    "packetloss 1-5% ran to core": "PL 1-5% RAN to Core",
    "packetloss >5% ran to core": "PL >5% RAN to Core",
    packetloss_internet: "PL Core to Internet",
    latency_internet: "Latency Core to Internet",
    jitter_internet: "Jitter Core to Internet",
    mttrq_major: "MTTRQ Major",
    mttrq_minor: "MTTRQ Minor",
    mttrq_critical: "MTTRQ Critical",
  };

  return labels[option] ?? option.charAt(0).toUpperCase() + option.slice(1);
};

export const TREND_PARAMETERS = [
  "packetloss ran to core",
  "packetloss 1-5% ran to core",
  "packetloss >5% ran to core",
  "latency ran to core",
  "jitter ran to core",
  "packetloss core to internet",
  "latency core to internet",
  "jitter core to internet",
  "mttrq ran to core major",
  "mttrq ran to core minor",
];

export const AREA_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Area 1", value: "treg1" },
  { label: "Area 2", value: "treg2" },
  { label: "Area 3", value: "treg3" },
  { label: "Area 4", value: "treg4" },
];

export const FILTER_BY_OPTIONS = [
  { label: "By Total Ne", value: "by total ne" },
  { label: "By Achievement", value: "by ach" },
];

/**
 * KPI MTTRQ dikelompokkan dulu per wilayah (Jawa / Non Jawa): baris ringkasan
 * wilayah menjadi induk, region di bawahnya jadi anak.
 */
export const mapMsaRegionRows = (data: unknown, parameter: string): MsaRow[] => {
  if (!isMttrqParameter(parameter)) return mapMsaRows(data, "region");

  const flattened = flattenMsaData(data);
  const rowWilayah = (row: MsaRow) =>
    String(row.wilayah ?? "").toLowerCase();
  const rowRegion = (row: MsaRow) => String(row.region ?? "").toLowerCase();

  const summaryRows = flattened.filter(
    (row) => rowWilayah(row) === rowRegion(row),
  );

  return mapMsaRows(summaryRows, "region").map((summaryRow) => {
    const target = String(summaryRow.parameter ?? "").toLowerCase();
    const children = mapMsaRows(
      flattened.filter(
        (row) => rowWilayah(row) === target && rowRegion(row) !== target,
      ),
      "region",
    ).map((regionRow, index) => ({
      ...regionRow,
      mini_parameter: parameter,
      identIndex: `${summaryRow.parameter}_reg_${index}_${regionRow.parameter ?? index}`,
    }));

    return { ...summaryRow, mini_parameter: parameter, children };
  });
};

/** Ekspansi baris wilayah MTTRQ mengambil region milik wilayah tersebut. */
export const mapMsaWitelRows = (
  data: unknown,
  { parameter, region }: { parameter: string; region: string },
): MsaRow[] => {
  const expandsWilayah = isMttrqParameter(parameter) && isWilayahRow(region);

  if (!expandsWilayah) return mapMsaRows(data, "witel");

  const target = region.toLowerCase().trim();
  const filtered = flattenMsaData(data).filter((row) => {
    const wilayah = String(row.wilayah ?? "").toLowerCase();
    const rowRegion = String(row.region ?? "").toLowerCase();

    return wilayah === target && rowRegion !== target;
  });

  return mapMsaRows(filtered, "region");
};
