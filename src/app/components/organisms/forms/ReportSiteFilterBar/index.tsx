import { LuFileSpreadsheet } from "react-icons/lu";

import { Button } from "@/app/components/atoms";

import FilterDropdown from "@/app/components/molecules/FilterDropdown";

import {
  REPORT_SITE_MONTH_OPTIONS,
  REPORT_SITE_PARAMETER_OPTIONS,
} from "@/app/config/reportSite.config";

interface ReportSiteFilterBarProps {
  parameter: string;
  month: string;
  year: string;
  yearOptions: { label: string; value: string }[];
  onParameterChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onExport: () => void;
  isExporting?: boolean;
}

const ReportSiteFilterBar = ({
  parameter,
  month,
  year,
  yearOptions,
  onParameterChange,
  onMonthChange,
  onYearChange,
  onExport,
  isExporting = false,
}: ReportSiteFilterBarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold tracking-wide text-[#1f4fa3]">
        SUMMARY ASSESSMENT
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <FilterDropdown
        title="Parameter"
        options={REPORT_SITE_PARAMETER_OPTIONS}
        value={parameter}
        onChange={onParameterChange}
      />
      <FilterDropdown
        title="Month"
        options={REPORT_SITE_MONTH_OPTIONS}
        value={month}
        onChange={onMonthChange}
      />
      <FilterDropdown
        title="Year"
        options={yearOptions}
        value={year}
        onChange={onYearChange}
      />

      <Button
        variant="gradient"
        size="lg"
        className="rounded-full"
        loading={isExporting}
        icon={<LuFileSpreadsheet size={16} />}
        onClick={onExport}
      >
        Export Recon
      </Button>
    </div>
  </div>
);

export default ReportSiteFilterBar;
