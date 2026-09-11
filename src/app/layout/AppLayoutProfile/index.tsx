// Components
import { AppRouteWrapper } from "@/app/components";

// Layout
import AppShell from "@/app/layout/AppShell";

/** Halaman profil berdiri sendiri: tanpa menu CNOP, cukup kembali ke landing. */
const AppLayoutProfile = () => (
  <AppShell title="Profile">
    <AppRouteWrapper />
  </AppShell>
);

AppLayoutProfile.displayName = "AppLayoutProfile";

export { AppLayoutProfile };
