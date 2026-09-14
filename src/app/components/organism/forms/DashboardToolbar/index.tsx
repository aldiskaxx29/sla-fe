import type { ReactNode } from "react";

interface DashboardToolbarProps {
  children?: ReactNode;
  actions?: ReactNode;
  initials: string;
}

export function DashboardToolbar({
  children,
  actions,
  initials,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>

      <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e2e8f0] bg-white p-1.5">
        {actions}

        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1f6eeb] text-xs font-medium text-white">
          {initials}
        </span>
      </div>
    </div>
  );
}
