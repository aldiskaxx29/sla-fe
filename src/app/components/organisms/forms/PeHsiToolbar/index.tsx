import { LuCalendarDays, LuUpload } from "react-icons/lu";

interface PeHsiToolbarProps {
  lastUpdated: string;
  selectedAt: string;
  onSelectedAtChange: (value: string) => void;
  onExport?: () => void;
}

export function PeHsiToolbar({
  lastUpdated,
  selectedAt,
  onSelectedAtChange,
  onExport,
}: PeHsiToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex h-10 items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4">
        <LuCalendarDays className="size-5 shrink-0 text-[#64748b]" />
        <span className="text-sm font-medium text-[#64748b]">
          Last Updated : {lastUpdated}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          step={3600}
          value={selectedAt}
          onChange={(event) => onSelectedAtChange(event.target.value)}
          aria-label="Tanggal dan jam data"
          className="h-10 rounded-full border border-[#e2e8f0] bg-white px-4 text-sm text-[#0f172a] outline-none focus:border-[#cbd5e1]"
        />

        <button
          type="button"
          onClick={onExport}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <LuUpload className="size-4" />
          Export
        </button>
      </div>
    </div>
  );
}
