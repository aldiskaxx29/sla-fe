import type { ReactNode } from "react";

interface MsaSectionProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Judul pil abu-abu khas dashboard MSA, dipakai di tiap seksi. */
export const MsaSection = ({ title, actions, children }: MsaSectionProps) => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex h-12 items-center rounded-[54px] bg-[#ededed] px-4">
        <p className="text-base font-semibold text-[#0e2133]">{title}</p>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>

    {children}
  </section>
);

interface MsaTemplateProps {
  toolbar?: ReactNode;
  children: ReactNode;
}

/** Kerangka halaman MSA: satu kartu putih berisi seluruh seksi dashboard. */
const MsaTemplate = ({ toolbar, children }: MsaTemplateProps) => (
  <main className="bg-white p-6">
    <div className="flex flex-col gap-6 rounded-xl border border-[#dbdbdb] bg-white p-4">
      {toolbar}
      {children}
    </div>
  </main>
);

export default MsaTemplate;
