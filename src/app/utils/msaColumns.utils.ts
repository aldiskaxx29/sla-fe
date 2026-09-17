import type { MsaRow } from "@/app/types/msa/msa.types";
import { MONTH_LONG_LABELS } from "@/app/utils/msa.utils";

export type MsaColumnKind =
  | "week"
  | "realisasi-before"
  | "realisasi-after"
  | "achievement"
  | "score";

export interface MsaLeafColumn {
  key: string;
  title: string;
  kind: MsaColumnKind;
  monthNum: number;
  /** Nomor minggu relatif dalam bulan, hanya untuk kolom minggu. */
  weekNum?: number;
}

export interface MsaMonthColumn {
  key: string;
  title: string;
  monthNum: number;
  children: MsaLeafColumn[];
}

const hasMeaningfulValue = (value: unknown) =>
  !(value === null || value === undefined || value === "" || value === "-");

/** Baris ringkasan (weighted / service credit) tidak bisa di-expand. */
export const isSummaryRow = (row: MsaRow) => {
  const parameter = String(row.parameter ?? "").toLowerCase();

  return parameter.includes("service") || parameter.includes("weighted");
};

export const isPacketlossRanToCore = (row: MsaRow) => {
  const values = [row.parameter, row.mini_parameter].map((value) =>
    String(value ?? "").toLowerCase(),
  );

  return values.some(
    (value) =>
      value.includes("packetloss 1-5% ran to core") ||
      value.includes("packetloss >5% ran to core") ||
      value.includes("packetloss ran to core"),
  );
};

/**
 * Kolom minggu bisa datang sebagai `ach_<bulan>_<minggu>` atau
 * `ach_<bulan>_<minggu>_<mingguTahun>`; versi 3 angka dipakai untuk label
 * "Minggu Tahunan".
 */
const collectWeeklyKeys = (sample: MsaRow) => {
  const keys = Object.keys(sample).filter((key) =>
    /^ach_\d+_\d+(?:_\d+)?$/.test(key),
  );

  const byMonthWeek = new Map<string, string>();

  keys.forEach((key) => {
    const parts = key.split("_");
    const monthWeek = `${parts[1]}_${parts[2]}`;

    if (!byMonthWeek.has(monthWeek) || parts.length === 4) {
      byMonthWeek.set(monthWeek, key);
    }
  });

  return Array.from(byMonthWeek.values());
};

export const findActualWeekNumber = (
  rows: MsaRow[],
  monthNum: number,
  weekNum: number,
): string | null => {
  const pattern = new RegExp(`^ach_${monthNum}_${weekNum}_(\\d+)$`);

  for (const row of rows) {
    const foundKey = Object.keys(row).find((key) => pattern.test(key));
    const match = foundKey?.match(pattern);

    if (match) return match[1];
  }

  return null;
};

/**
 * Kolom tabel MSA dibangun dari kunci yang benar-benar ada di data, karena
 * backend hanya mengirim bulan yang sudah berjalan.
 */
export const buildMsaMonthColumns = (
  rows: MsaRow[],
  showActualWeeks: boolean,
): MsaMonthColumn[] => {
  const sample = rows.find((row) => row && Object.keys(row).length > 0);

  if (!sample) return [];

  const weeklyKeys = collectWeeklyKeys(sample);

  const monthlyKeys = Object.keys(sample)
    .filter((key) => /^ach_fm_\d+$/.test(key))
    .sort(
      (a, b) =>
        Number(a.replace("ach_fm_", "")) - Number(b.replace("ach_fm_", "")),
    );

  const activeMonthlyKeys = monthlyKeys.filter((monthKey) => {
    const monthNum = Number(monthKey.replace("ach_fm_", ""));
    const relatedWeeks = weeklyKeys.filter((weekKey) =>
      weekKey.startsWith(`ach_${monthNum}_`),
    );
    const relevantKeys = [
      `ach_fm_${monthNum}`,
      `score_fm_${monthNum}`,
      `realisasi_fm_before_${monthNum}`,
      `realisasi_fm_after_${monthNum}`,
      ...relatedWeeks,
    ];

    return rows.some((row) =>
      relevantKeys.some((key) => hasMeaningfulValue(row[key])),
    );
  });

  const displayKeys = activeMonthlyKeys.length ? activeMonthlyKeys : monthlyKeys;

  return displayKeys.map((monthKey, monthIndex) => {
    const monthNum = Number(monthKey.replace("ach_fm_", ""));

    /**
     * Bulan paling awal hanya menampilkan ringkasan (tanpa rincian minggu)
     * karena periodenya sudah ditutup; rincian minggu baru muncul pada
     * bulan-bulan berikutnya yang masih berjalan.
     */
    const isClosedMonth = monthIndex === 0;

    if (isClosedMonth) {
      return {
        key: monthKey,
        title: MONTH_LONG_LABELS[monthNum] ?? monthKey,
        monthNum,
        children: [
          {
            key: `realisasi_fm_before_${monthNum}`,
            title: "REALISASI BEFORE",
            kind: "realisasi-before" as const,
            monthNum,
          },
          {
            key: `realisasi_fm_after_${monthNum}`,
            title: "REALISASI AFTER",
            kind: "realisasi-after" as const,
            monthNum,
          },
          {
            key: `ach_fm_${monthNum}`,
            title: "ACHIEVEMENT",
            kind: "achievement" as const,
            monthNum,
          },
          {
            key: `score_fm_${monthNum}`,
            title: "SCORE",
            kind: "score" as const,
            monthNum,
          },
        ],
      };
    }

    const weekColumns: MsaLeafColumn[] = weeklyKeys
      .filter((weekKey) => weekKey.startsWith(`ach_${monthNum}_`))
      .map((weekKey) => {
        const parts = weekKey.split("_");
        const weekNum = Number(parts[2]);
        const actualWeek =
          parts[3] ?? findActualWeekNumber(rows, monthNum, weekNum);

        return {
          key: weekKey,
          title:
            showActualWeeks && actualWeek ? `W${actualWeek}` : `W${weekNum}`,
          kind: "week" as const,
          monthNum,
          weekNum,
        };
      });

    return {
      key: monthKey,
      title: MONTH_LONG_LABELS[monthNum] ?? monthKey,
      monthNum,
      children: [
        ...weekColumns,
        {
          key: `realisasi_fm_before_${monthNum}`,
          title: "REALISASI BEFORE",
          kind: "realisasi-before",
          monthNum,
        },
        {
          key: `realisasi_fm_after_${monthNum}`,
          title: "REALISASI AFTER",
          kind: "realisasi-after",
          monthNum,
        },
        {
          key: `ach_fm_${monthNum}`,
          title: "ACHIEVEMENT",
          kind: "achievement",
          monthNum,
        },
      ],
    };
  });
};

/**
 * Warna sel: packetloss makin kecil makin baik, KPI lain sebaliknya.
 * Nilai tanpa target dibiarkan netral.
 */
export const resolveValueTone = (
  row: MsaRow,
  value: unknown,
): "good" | "bad" | "neutral" => {
  const target = Number(row.target);
  const numeric = Number(value);

  if (!hasMeaningfulValue(value)) return "neutral";
  if (!Number.isFinite(target) || !Number.isFinite(numeric)) return "neutral";

  const lowerIsBetter = isPacketlossRanToCore(row);
  const isGood = lowerIsBetter ? numeric <= target : numeric >= target;

  return isGood ? "good" : "bad";
};

export const toneClassName = (tone: "good" | "bad" | "neutral") => {
  if (tone === "good") return "text-[#16a34a] bg-[#f0fdf4]";
  if (tone === "bad") return "text-[#dc2626] bg-[#fef2f2]";

  return "text-[#0f172a]";
};

/** Nilai persen ditampilkan dengan satuan dari baris data. */
export const formatCellValue = (row: MsaRow, value: unknown) => {
  if (!hasMeaningfulValue(value)) return "-";

  return row.satuan === "%" ? `${value}%` : String(value);
};
