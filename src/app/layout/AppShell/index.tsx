// React
import type { ReactNode } from "react";

// Molecules
import { ScallopedTitleBar } from "@/app/components/molecules/ScallopedTitleBar";

// Organism
import {
  DashboardSidebar,
  type DashboardSidebarMenu,
} from "@/app/components/organism/navigation/DashboardSidebar";

interface AppShellProps {
  /** Kosongkan kalau halamannya berdiri sendiri, mis. profil. */
  menus?: DashboardSidebarMenu[];
  activeKey?: string;
  title: string;
  children: ReactNode;
}

/**
 * Kerangka dashboard di luar CNOP: bar judul bergelombang selebar halaman,
 * sidebar rail di kiri, lalu area konten.
 */
const AppShell = ({ menus = [], activeKey, title, children }: AppShellProps) => (
  <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
    <ScallopedTitleBar title={title} />

    <div className="flex min-h-0 flex-1">
      <DashboardSidebar menus={menus} activeKey={activeKey} />

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  </div>
);

export default AppShell;
