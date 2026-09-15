// Components
import { AppRouteWrapper } from "@/app/components";

// Templates
import DashboardShellTemplate from "@/app/components/templates/DashboardShellTemplate";

/** Halaman profil berdiri sendiri: tanpa menu CNOP, cukup kembali ke landing. */
const AppLayoutProfile = () => (
  <DashboardShellTemplate title="Profile">
    <AppRouteWrapper />
  </DashboardShellTemplate>
);

AppLayoutProfile.displayName = "AppLayoutProfile";

export { AppLayoutProfile };
