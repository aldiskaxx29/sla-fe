import type { ReactNode } from "react";

interface ResumeRcaTemplateProps {
  toolbar: ReactNode;
  children: ReactNode;
}

const ResumeRcaTemplate = ({ toolbar, children }: ResumeRcaTemplateProps) => (
  <main className="m-6 flex flex-col gap-4 rounded-[28px] border border-[#e2e8f0] bg-white p-5 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
    {toolbar}

    <div className="flex min-w-0 flex-col gap-4">{children}</div>
  </main>
);

export default ResumeRcaTemplate;
