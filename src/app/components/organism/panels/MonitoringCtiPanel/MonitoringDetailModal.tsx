import { useEffect } from "react";
import { LuX } from "react-icons/lu";

import {
  CtiDetailContent,
  type CtiDetailTarget,
} from "@/app/components/organism/panels/MonitoringCtiPanel/CtiDetailContent";
import {
  OnxDetailContent,
  type OnxDetailTarget,
} from "@/app/components/organism/panels/MonitoringCtiPanel/OnxDetailContent";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";

// Utils
import { formatMonitoringHour } from "@/app/utils/monday.utils";

export type MonitoringSource = "CTI" | "ONX";

interface MonitoringDetailModalProps {
  open: boolean;
  source: MonitoringSource;
  onSourceChange: (source: MonitoringSource) => void;
  /** Data CTI dipakai bersama kartu, jadi tidak di-fetch ulang di sini. */
  ctiRows: CtiRow[];
  ctiTarget: CtiDetailTarget | null;
  onCtiTargetChange: (target: CtiDetailTarget | null) => void;
  onxTarget: OnxDetailTarget | null;
  onOnxTargetChange: (target: OnxDetailTarget | null) => void;
  onClose: () => void;
}

const SOURCES: MonitoringSource[] = ["CTI", "ONX"];

/** Satu popup untuk dua sumber monitoring; isinya ganti lewat tab CTI/ONX. */
export function MonitoringDetailModal({
  open,
  source,
  onSourceChange,
  ctiRows,
  ctiTarget,
  onCtiTargetChange,
  onxTarget,
  onOnxTargetChange,
  onClose,
}: MonitoringDetailModalProps) {
  const hasDrilldown = source === "CTI" ? Boolean(ctiTarget) : Boolean(onxTarget);

  // Isi popup menangani Escape-nya sendiri saat sedang di drilldown.
  useEffect(() => {
    if (!open || hasDrilldown) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, hasDrilldown, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Monitoring ${source}`}
        className="flex max-h-[85vh] w-full max-w-[1250px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#213c52]">
              Monitoring {source} {formatMonitoringHour()} WIB
            </h2>
            {/* Region yang sedang dibuka, seperti di tampilan lamanya. */}
            {source === "ONX" && onxTarget?.region && (
              <span className="truncate rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                {onxTarget.region}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {SOURCES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSourceChange(item)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-[11px] font-extrabold transition-all ${
                    source === item
                      ? "bg-[#007BFF] text-white shadow-xs"
                      : "text-slate-500 hover:text-[#213c52]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <LuX size={16} />
            </button>
          </div>
        </header>

        {source === "CTI" ? (
          <CtiDetailContent
            rows={ctiRows}
            target={ctiTarget}
            onSelectTarget={onCtiTargetChange}
          />
        ) : (
          <OnxDetailContent
            target={onxTarget}
            onSelectTarget={onOnxTargetChange}
          />
        )}
      </div>
    </div>
  );
}

export default MonitoringDetailModal;
