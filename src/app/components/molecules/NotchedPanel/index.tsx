import type { ReactNode } from "react";

const NOTCH_PATH =
  "M0 0h548c-102.75 0-75.582 73-133.886 73H129.216C81.031 73 102.75 0 0 0z";

interface NotchedPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Kolom dashboard dengan takik (notch) berisi judul di tengah atas. SVG-nya
 * diregangkan mengikuti lebar kolom, jadi bisa dipakai di grid berapa pun.
 */
export function NotchedPanel({
  title,
  children,
  className = "",
}: NotchedPanelProps) {
  return (
    <section
      className={`relative flex min-w-0 flex-col rounded-[28px] border border-[#e2e8f0] bg-[#f1f5f9] px-3 pt-12 pb-3 ${className}`.trim()}
    >
      <div className="pointer-events-none absolute top-0 left-1/2 h-[42px] w-[68%] max-w-[320px] min-w-[180px] -translate-x-1/2">
        <svg
          viewBox="0 0 548 73"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path d={NOTCH_PATH} fill="#ffffff" />
        </svg>

        <h2 className="absolute top-[8px] left-1/2 max-w-[80%] -translate-x-1/2 truncate text-center text-[15px] font-semibold text-[#020617]">
          {title}
        </h2>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
