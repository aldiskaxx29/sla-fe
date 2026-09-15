import type { ReactNode } from "react";

import {
  DashboardSidebar,
  type DashboardSidebarMenu,
} from "@/app/components/organisms/navigation/DashboardSidebar";
import { ScallopedTitleBar } from "@/app/components/organisms/navigation/ScallopedTitleBar";

interface DashboardShellTemplateProps {
  menus?: DashboardSidebarMenu[];
  activeKey?: string;
  title: string;
  children: ReactNode;
}

const DashboardShellTemplate = ({
  menus = [],
  activeKey,
  title,
  children,
}: DashboardShellTemplateProps) => (
  <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
    <ScallopedTitleBar title={title} />

    <div className="flex min-h-0 flex-1">
      <DashboardSidebar menus={menus} activeKey={activeKey} />

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  </div>
);

export default DashboardShellTemplate;
