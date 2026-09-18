import type { ReactNode } from "react";

import { NotchedPanel } from "@/app/components/molecules/NotchedPanel";

interface TicketQualityTemplateProps {
  toolbar?: ReactNode;
  highlight: ReactNode;
  overview: ReactNode;
  analysis: ReactNode;
}

/**
 * Dashboard Ticket Quality disusun tiga kolom bertakik: ringkasan, overview
 * pencapaian, dan analisis performa. Di layar sempit kolomnya menumpuk.
 */
const TicketQualityTemplate = ({
  toolbar,
  highlight,
  overview,
  analysis,
}: TicketQualityTemplateProps) => (
  <>
    {toolbar ? <div className="px-6 pt-4 pb-4">{toolbar}</div> : null}

    <main className="flex flex-1 flex-col px-6 pb-6">
      {/* items-stretch: tinggi ketiga kolom disamakan, isi kolom yang menyusul
          (mis. tabel region) yang memanjang mengisi sisa ruang. */}
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <NotchedPanel title="Highlight Summary" className="h-full">
          {highlight}
        </NotchedPanel>
        <NotchedPanel title="Achievement Overview" className="h-full">
          {overview}
        </NotchedPanel>
        <NotchedPanel title="Performance Analysis" className="h-full">
          {analysis}
        </NotchedPanel>
      </div>
    </main>
  </>
);

export default TicketQualityTemplate;
