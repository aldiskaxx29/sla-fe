import { LuUpload } from "react-icons/lu";

import { Button } from "@/app/components/atoms";

import FilterDropdown from "@/app/components/molecules/FilterDropdown";

import type { ResumeRcaFilter } from "@/app/hooks/custom/useResumeRcaFilter";

interface ResumeRcaFilterBarProps {
  filter: ResumeRcaFilter;
  onUploadClick: () => void;
}

const ResumeRcaFilterBar = ({
  filter,
  onUploadClick,
}: ResumeRcaFilterBarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <span className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold tracking-wide text-[#1f4fa3]">
      RESUME RCA
    </span>

    <div className="flex flex-wrap items-center gap-3">
      <FilterDropdown
        title="Parameter"
        options={filter.options.parameter}
        value={filter.parameter}
        onChange={filter.setParameter}
      />

      {filter.isMttr ? (
        <>
          <FilterDropdown
            title="Year"
            options={filter.options.year}
            value={String(filter.year)}
            onChange={(value) => filter.setYear(Number(value))}
          />
          <FilterDropdown
            title="Month"
            options={filter.options.month}
            value={String(filter.month)}
            onChange={(value) => filter.setMonth(Number(value))}
          />
        </>
      ) : null}

      <FilterDropdown
        title="Week"
        options={filter.options.week}
        value={filter.week}
        onChange={filter.setWeek}
      />

      <Button
        variant="gradient"
        size="lg"
        className="rounded-full"
        icon={<LuUpload size={16} />}
        onClick={onUploadClick}
      >
        Upload Recon
      </Button>
    </div>
  </div>
);

export default ResumeRcaFilterBar;
