// React
import type { ReactNode } from "react";

interface MondayTemplateProps {
  /** Info kiri, mis. keterangan periode terakhir diperbarui. */
  leftContent?: ReactNode;
  /** Kontrol kanan, mis. filter dan tombol export. */
  rightContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Kerangka halaman monday: kartu putih berisi toolbar dan area panel.
 *
 * Padanan `PageCardLayout` di qosmo-new, tanpa `PageHeader`-nya — judul,
 * toggle tema, dan user menu sudah disediakan header global sla-fe.
 */
const MondayTemplate = ({
  leftContent,
  rightContent,
  children,
  className = "",
}: MondayTemplateProps) => {
  return (
    <div className="m-6 rounded-xl border border-[#DBDBDB] bg-white p-4 overflow-x-hidden">
      {leftContent || rightContent ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">{leftContent}</div>
          <div className="ml-auto flex items-center gap-2">{rightContent}</div>
        </div>
      ) : null}

      <div className={`w-full ${className}`}>{children}</div>
    </div>
  );
};

export default MondayTemplate;
