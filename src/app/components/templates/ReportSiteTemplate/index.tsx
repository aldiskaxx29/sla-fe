import type { ReactNode } from "react";

interface ReportSiteTemplateProps {
  toolbar: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

const ReportSiteTemplate = ({
  toolbar,
  description,
  children,
}: ReportSiteTemplateProps) => (
  <main className="m-6 flex flex-col gap-4 rounded-[28px] border border-[#e2e8f0] bg-white p-5 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
    {toolbar}

    {description ? (
      <p className="max-w-4xl text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    ) : null}

    <div className="min-w-0">{children}</div>
  </main>
);

export default ReportSiteTemplate;
