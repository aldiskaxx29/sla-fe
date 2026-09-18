import { LuCalendar, LuDownload } from "react-icons/lu";

import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import {
  TICKET_ACCESS_OPTIONS,
  TICKET_AREA_OPTIONS,
  TICKET_COMPARISON_OPTIONS,
  TICKET_PERIOD_OPTIONS,
} from "@/app/api/ticket";
import type { TicketAccessType } from "@/app/types/ticket/ticketQuality.types";

const SELECT_CLASS =
  "[&_button]:h-9 [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:px-4 [&_button]:text-xs [&_button]:text-[#020617]";

interface TicketQualityToolbarProps {
  accessType: TicketAccessType;
  comparison: string;
  area: string;
  period: string;
  lastUpdated: string;
  exporting?: boolean;
  onAccessTypeChange: (value: TicketAccessType) => void;
  onComparisonChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onExport: () => void;
}

export function TicketQualityToolbar({
  accessType,
  comparison,
  area,
  period,
  lastUpdated,
  exporting = false,
  onAccessTypeChange,
  onComparisonChange,
  onAreaChange,
  onPeriodChange,
  onExport,
}: TicketQualityToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#e2e8f0] bg-white p-1.5">
        <div className="flex items-center rounded-full bg-white">
          {TICKET_ACCESS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAccessTypeChange(option.value)}
              className={`h-8 cursor-pointer rounded-full px-4 text-xs font-semibold transition-colors ${
                accessType === option.value
                  ? "bg-[#4f46e5] text-white"
                  : "text-[#334155] hover:text-[#020617]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <SelectMenu
          value={comparison}
          options={TICKET_COMPARISON_OPTIONS}
          onChange={onComparisonChange}
          className={SELECT_CLASS}
        />

        <SelectMenu
          value={area}
          options={TICKET_AREA_OPTIONS}
          onChange={onAreaChange}
          className={SELECT_CLASS}
        />

        <SelectMenu
          value={period}
          options={TICKET_PERIOD_OPTIONS}
          onChange={onPeriodChange}
          className={SELECT_CLASS}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#e2e8f0] bg-white p-1.5">
        <span className="flex h-8 items-center gap-2 px-3 text-xs text-[#64748b]">
          <LuCalendar className="size-4 shrink-0" />
          Last Updated : {lastUpdated}
        </span>

        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="flex h-8 cursor-pointer items-center gap-2 rounded-full bg-[linear-gradient(90deg,#4f46e5_0%,#7c3aed_100%)] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LuDownload className="size-4 shrink-0" />
          {exporting ? "Menyiapkan…" : "Export"}
        </button>
      </div>
    </div>
  );
}
