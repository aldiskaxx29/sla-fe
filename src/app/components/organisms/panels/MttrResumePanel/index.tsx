import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

interface MttrResumePanelProps {
  total: number;
  closed: number;
  open: number;
  loading?: boolean;
  error?: boolean;
}

const toPercentage = (value: number, total: number) =>
  total ? ((value / total) * 100).toFixed(2) : "0.00";

export function MttrResumePanel({
  total,
  closed,
  open,
  loading = false,
  error = false,
}: MttrResumePanelProps) {
  const items = [
    { label: "Total Ticket", value: total, valueClass: "text-[#0f172a]", percent: "" },
    {
      label: "Clear",
      value: closed,
      valueClass: "text-emerald-600",
      percent: `${toPercentage(closed, total)}%`,
    },
    {
      label: "Not Clear",
      value: open,
      valueClass: "text-rose-600",
      percent: `${toPercentage(open, total)}%`,
    },
  ];

  return (
    <SectionCard className="flex h-full min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#020617]">Resume</h2>
        {error && (
          <span className="text-xs font-medium text-rose-600">
            Gagal memuat data
          </span>
        )}
      </div>

      <div className="grid flex-1 grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#f8fafc] px-3 py-5"
          >
            {loading ? (
              <Skeleton height={36} width={64} />
            ) : (
              <span className={`text-3xl font-bold ${item.valueClass}`}>
                {item.value}
              </span>
            )}
            <span className="text-[11px] font-semibold tracking-wide text-[#475569] uppercase">
              {item.label}
            </span>
            {item.percent ? (
              <span className="text-xs text-slate-500">{item.percent}</span>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default MttrResumePanel;
