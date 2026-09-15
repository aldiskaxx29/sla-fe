import type { ReactNode } from "react";

type ToolbarPlacement = "outside" | "inside";

interface DashboardContentTemplateProps {
  toolbar?: ReactNode;
  toolbarPlacement?: ToolbarPlacement;
  children: ReactNode;
}

const CONTENT_CARD =
  "flex min-h-0 flex-1 flex-col gap-4 rounded-[36px] border border-[#e2e8f0] bg-white p-4";

const DashboardContentTemplate = ({
  toolbar,
  toolbarPlacement = "outside",
  children,
}: DashboardContentTemplateProps) => {
  if (toolbarPlacement === "inside") {
    return (
      <main className="flex flex-1 flex-col p-4">
        <div className={CONTENT_CARD}>
          {toolbar}
          {children}
        </div>
      </main>
    );
  }

  return (
    <>
      {toolbar && <div className="px-6 pt-2 pb-4">{toolbar}</div>}

      <main
        className={`flex flex-1 flex-col px-6 pb-6 ${toolbar ? "" : "pt-2"}`}
      >
        <div className={CONTENT_CARD}>{children}</div>
      </main>
    </>
  );
};

export default DashboardContentTemplate;
