// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Types
import type { FbbOnxFilterState } from "@/app/types/fbb/onx.types";

interface FbbOnxFilterBarProps {
  value: FbbOnxFilterState;
  onChange: (value: FbbOnxFilterState) => void;
  options: {
    yearweek: string[];
    metrics: string[];
    kpi: string[];
    /** Kosongkan untuk menyembunyikan filter level (mis. halaman Ookla). */
    level?: string[];
    indihomeType: string[];
  };
  loading?: boolean;
}

/** "202635" -> "W35 2026" */
const weekLabel = (yearweek: string) =>
  yearweek.length === 6
    ? `W${Number(yearweek.slice(4))} ${yearweek.slice(0, 4)}`
    : yearweek;

const toOptions = (values: string[], allLabel?: string) => [
  ...(allLabel ? [{ label: allLabel, value: "" }] : []),
  ...values.map((value) => ({ label: value, value })),
];

/** Pil filter dibuat selebar 160px seperti desain. */
const PILL_CLASS =
  "[&>div]:w-[160px] [&_button]:h-8 [&_button]:w-[160px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-[#f8fafc] [&_button]:px-3 [&_button]:text-xs [&_button]:font-medium [&_button]:text-[#0f172a] [&_button>span]:truncate";

/** Deretan filter benchmark ONX dalam satu bar mendatar. */
export function FbbOnxFilterBar({
  value,
  onChange,
  options,
  loading = false,
}: FbbOnxFilterBarProps) {
  const update = (patch: Partial<FbbOnxFilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#e2e8f0] bg-white p-1.5">
      <SelectMenu
        value={value.yearweek}
        options={options.yearweek.map((week) => ({
          label: weekLabel(week),
          value: week,
        }))}
        onChange={(yearweek) => update({ yearweek })}
        placeholder={loading ? "Memuat minggu..." : "Select Week"}
        size="sm"
        className={PILL_CLASS}
      />
      <SelectMenu
        value={value.metrics}
        options={toOptions(options.metrics, "All Metrics")}
        onChange={(metrics) => update({ metrics })}
        placeholder="Select Filter Metrics"
        size="sm"
        className={PILL_CLASS}
      />
      <SelectMenu
        value={value.kpi}
        options={toOptions(options.kpi, "All KPI")}
        onChange={(kpi) => update({ kpi })}
        placeholder="Select KPI"
        size="sm"
        className={PILL_CLASS}
      />
      {options.level?.length ? (
        <SelectMenu
          value={value.level}
          options={toOptions(options.level)}
          onChange={(level) => update({ level })}
          placeholder="Select Level"
          size="sm"
          className={PILL_CLASS}
        />
      ) : null}
      <SelectMenu
        value={value.indihomeType}
        options={toOptions(options.indihomeType)}
        onChange={(indihomeType) => update({ indihomeType })}
        placeholder="Category"
        size="sm"
        className={PILL_CLASS}
      />
    </div>
  );
}
