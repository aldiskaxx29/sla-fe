import { LuFileSpreadsheet } from "react-icons/lu";

import { Button } from "@/app/components/atoms";

import FilterDropdown from "@/app/components/molecules/FilterDropdown";

import { AREA_OPTIONS, FILTER_BY_OPTIONS } from "@/app/utils/msa.utils";

interface MsaToolbarProps {
  treg: string;
  filter: string;
  showActualWeeks: boolean;
  exporting?: boolean;
  onTregChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onShowActualWeeksChange: (value: boolean) => void;
  onExport: () => void;
}

const toggleClass = (active: boolean) =>
  `cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
    active
      ? "bg-[#5195d4] text-white shadow-sm"
      : "text-[#64748b] hover:text-[#0f172a]"
  }`;

export function MsaToolbar({
  treg,
  filter,
  showActualWeeks,
  exporting = false,
  onTregChange,
  onFilterChange,
  onShowActualWeeksChange,
  onExport,
}: MsaToolbarProps) {
  return (
    <div className="flex flex-wrap items-end justify-end gap-4">
      <FilterDropdown
        title="Filter Area"
        placeholder="All"
        options={AREA_OPTIONS}
        value={treg}
        onChange={onTregChange}
      />

      <FilterDropdown
        title="Filter By"
        placeholder="All"
        options={FILTER_BY_OPTIONS}
        value={filter}
        onChange={onFilterChange}
      />

      <div className="inline-flex h-11 items-center rounded-full border border-[#dbdbdb] bg-[#f8fafc] p-1">
        <button
          type="button"
          className={toggleClass(!showActualWeeks)}
          onClick={() => onShowActualWeeksChange(false)}
        >
          Minggu Bulanan
        </button>
        <button
          type="button"
          className={toggleClass(showActualWeeks)}
          onClick={() => onShowActualWeeksChange(true)}
        >
          Minggu Tahunan
        </button>
      </div>

      <Button
        variant="pill"
        size="lg"
        loading={exporting}
        onClick={onExport}
        suffixIcon={<LuFileSpreadsheet className="size-4" />}
      >
        Export as XLS
      </Button>
    </div>
  );
}
