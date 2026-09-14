import xlxsIcon from "@/assets/file-spreadsheet.svg";

import { FilterDropdown, PillButton, SearchInput } from "@/app/components/atoms";

import type { RekonsiliasiPeriod } from "@/app/hooks/custom/useRekonsiliasiPeriod";

interface RekonsiliasiFilterBarProps {
  period: RekonsiliasiPeriod;
  search: string;
  onSearchChange: (value: string) => void;
  onDownloadTemplate: () => void;
  onImportClick: () => void;
  isDownloading?: boolean;
}

const RekonsiliasiFilterBar = ({
  period,
  search,
  onSearchChange,
  onDownloadTemplate,
  onImportClick,
  isDownloading = false,
}: RekonsiliasiFilterBarProps) => {
  return (
    <div className="flex justify-between mb-3 gap-4 overflow-x-auto">
      <div className="flex gap-4 flex-nowrap min-w-max">
        <FilterDropdown
          title="Site Type"
          placeholder="All"
          options={period.options.siteType}
          value={period.prev}
          onChange={period.setPrev}
        />
        <FilterDropdown
          title="Exclude"
          placeholder="All"
          options={period.options.exclude}
          value={period.exclude}
          onChange={period.setExclude}
        />
        <FilterDropdown
          title="Evidence"
          placeholder="All"
          options={period.options.evidence}
          value={period.evidence}
          onChange={period.setEvidence}
        />
        <FilterDropdown
          title="Parameter"
          placeholder="All"
          options={period.options.parameter}
          value={period.parameter}
          onChange={period.setParameter}
        />
        <FilterDropdown
          title="Tahun"
          placeholder="All"
          options={period.options.year}
          value={period.year}
          onChange={period.setYear}
        />
        <FilterDropdown
          title="Month"
          placeholder="All"
          options={period.options.month}
          value={period.month}
          onChange={period.setMonth}
        />
        {!period.isMttrqParameter && (
          <FilterDropdown
            title="Week"
            placeholder="All"
            options={period.options.week}
            value={period.week}
            onChange={period.setWeek}
          />
        )}

        <div className="flex flex-col justify-end">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search site..."
          />
        </div>

        <PillButton
          label="Download Template Excel"
          icon={xlxsIcon}
          onClick={onDownloadTemplate}
          loading={isDownloading}
        />
        <PillButton
          label="Import Excel"
          icon={xlxsIcon}
          onClick={onImportClick}
        />
      </div>
    </div>
  );
};

export default RekonsiliasiFilterBar;
