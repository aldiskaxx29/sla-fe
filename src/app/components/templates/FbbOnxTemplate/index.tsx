// React
import type { ReactNode } from "react";

interface FbbOnxTemplateProps {
  /** Panel filter kiri. */
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Kerangka halaman benchmark ONX: filter di kiri, konten di kanan. Barisnya
 * `items-stretch`, jadi kartu filter setinggi kolom kanan. Di layar sempit
 * filter naik ke atas konten.
 */
const FbbOnxTemplate = ({ sidebar, children }: FbbOnxTemplateProps) => (
  <div className="m-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
    <div className="rounded-xl border border-[#DBDBDB] bg-white p-4 lg:w-64 lg:shrink-0">
      {sidebar}
    </div>

    <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
  </div>
);

export default FbbOnxTemplate;
