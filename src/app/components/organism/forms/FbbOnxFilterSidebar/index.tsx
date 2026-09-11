// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Types
import type { FbbOnxFilterState } from "@/app/types/fbb/onx.types";

interface FbbOnxFilterSidebarProps {
  value: FbbOnxFilterState;
  onChange: (value: FbbOnxFilterState) => void;
  options: {
    yearweek: string[];
    metrics: string[];
    kpi: string[];
    level: string[];
    indihomeType: string[];
  };
  loading?: boolean;
}

const toOptions = (values: string[], allLabel?: string) => [
  ...(allLabel ? [{ label: allLabel, value: "" }] : []),
  ...values.map((value) => ({ label: value, value })),
];

/** "202635" -> "W35 2026" */
const weekLabel = (yearweek: string) =>
  yearweek.length === 6
    ? `W${Number(yearweek.slice(4))} ${yearweek.slice(0, 4)}`
    : yearweek;

const selectClass =
  "w-full [&>div]:w-full [&_button]:w-full [&_button]:justify-between text-[13px]";

/** Panel filter kiri halaman benchmark ONX. */
export function FbbOnxFilterSidebar({
  value,
  onChange,
  options,
  loading = false,
}: FbbOnxFilterSidebarProps) {
  const update = (patch: Partial<FbbOnxFilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <aside className="flex h-full w-full flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-navy">Metrics</h2>

        <SelectMenu
          value={value.yearweek}
          options={options.yearweek.map((week) => ({
            label: weekLabel(week),
            value: week,
          }))}
          onChange={(week) => update({ yearweek: week })}
          placeholder={loading ? "Memuat minggu..." : "Select Week"}
          size="md"
          className={selectClass}
        />

        <SelectMenu
          value={value.metrics}
          options={toOptions(options.metrics, "All Metrics")}
          onChange={(metrics) => update({ metrics })}
          placeholder="Select Filter Metrics"
          size="md"
          className={selectClass}
        />

        <SelectMenu
          value={value.kpi}
          options={toOptions(options.kpi, "All KPI")}
          onChange={(kpi) => update({ kpi })}
          placeholder="Select KPI"
          size="md"
          className={selectClass}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-navy">Location Level</h2>

        <SelectMenu
          value={value.level}
          options={toOptions(options.level)}
          onChange={(level) => update({ level })}
          placeholder="Select Level"
          size="md"
          className={selectClass}
        />

        <SelectMenu
          value={value.indihomeType}
          options={toOptions(options.indihomeType)}
          onChange={(indihomeType) => update({ indihomeType })}
          placeholder="Category"
          size="md"
          className={selectClass}
        />
      </section>
    </aside>
  );
}
