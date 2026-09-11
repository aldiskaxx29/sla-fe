// React
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Mis. tombol "Coba lagi" saat data gagal dimuat. */
  action?: ReactNode;
  className?: string;
}

/** Pesan tengah untuk halaman/tabel yang belum ada isinya atau gagal dimuat. */
export function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`.trim()}
    >
      <p className="text-base font-semibold text-navy">{title}</p>
      {description ? (
        <p className="max-w-xl text-sm text-slate-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
