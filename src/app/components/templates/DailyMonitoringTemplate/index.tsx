import type { ReactNode, RefObject } from "react";

interface DailyMonitoringTemplateProps {
  actions?: ReactNode;
  title: string;
  subtitle: string;
  captureRef: RefObject<HTMLDivElement | null>;
  splitMode?: boolean;
  children: ReactNode;
}

const DailyMonitoringTemplate = ({
  actions,
  title,
  subtitle,
  captureRef,
  splitMode = false,
  children,
}: DailyMonitoringTemplateProps) => (
  <main className="min-h-full px-4 py-4 md:px-6">
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
      {actions ? <div className="flex justify-end">{actions}</div> : null}

      <div
        ref={captureRef}
        id="daily-monitoring-export-root"
        className="daily-monitoring-export-root flex flex-col gap-6 bg-slate-100"
        data-split-mode={splitMode ? "true" : "false"}
      >
        <header className="flex flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-center bg-gray-200 p-4">
            <h1 className="daily-monitoring-page-title font-bold uppercase tracking-wide text-blue-600 max-md:text-center">
              {title}
            </h1>
          </div>
          <p className="daily-monitoring-page-subtitle ml-4 font-medium text-gray-600">
            {subtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">{children}</div>
      </div>
    </div>
  </main>
);

export default DailyMonitoringTemplate;
